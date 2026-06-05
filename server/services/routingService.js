const { queryAll } = require('../database');

const EARTH_RADIUS = 6378137;
const GRID_RESOLUTION = 10;
// 禁飞区 / 避让区周围的安全冗余距离 (米)。
// 任何航段都不允许进入此缓冲区内，由栅格膨胀 + 可视图顶点外推 + 多边形推出共同保证。
const SAFETY_BUFFER_M = 20;
const BUFFER_CELLS = Math.ceil(SAFETY_BUFFER_M / GRID_RESOLUTION);
const METERS_PER_DEG_LAT = 111320;

// 点到线段距离 (与输入同单位)
function distancePointToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// 点到环 (闭合多边形边界) 最短距离
function distancePointToRing(px, py, ring) {
  let min = Infinity;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const d = distancePointToSegment(px, py, ring[i][0], ring[i][1], ring[j][0], ring[j][1]);
    if (d < min) min = d;
  }
  return min;
}

function lonLatToLocal(lon, lat, ref) {
  const dLon = (lon - ref.lon) * Math.PI / 180;
  const dLat = (lat - ref.lat) * Math.PI / 180;
  const cosLat = Math.cos(ref.lat * Math.PI / 180);
  const x = dLon * EARTH_RADIUS * cosLat;
  const y = dLat * EARTH_RADIUS;
  return { x, y };
}

function localToLonLat(x, y, ref) {
  const cosLat = Math.cos(ref.lat * Math.PI / 180);
  const lon = ref.lon + (x / (EARTH_RADIUS * cosLat)) * 180 / Math.PI;
  const lat = ref.lat + (y / EARTH_RADIUS) * 180 / Math.PI;
  return { lon, lat };
}

function pointInPolygon(px, py, polygon) {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function loadNoFlyZonesAsGrid(bounds, grid, ref) {
  const zones = queryAll('SELECT * FROM no_fly_zones');
  for (const zone of zones) {
    const geometry = JSON.parse(zone.geometry);
    if (!geometry.coordinates || !geometry.coordinates[0]) continue;
    const ring = geometry.coordinates[0];
    const localRing = ring.map(([lon, lat]) => {
      const p = lonLatToLocal(lon, lat, ref);
      return [p.x, p.y];
    });
    const minAlt = zone.min_alt || 0;
    const maxAlt = zone.max_alt || 10000;
    const startTime = zone.start_time;
    const endTime = zone.end_time;
    if (startTime || endTime) continue; // skip time-bound zones for now

    // 膨胀栅格：内部 + 距边界 ≤ SAFETY_BUFFER_M 的格子都禁飞
    for (let ix = bounds.minX; ix <= bounds.maxX; ix++) {
      for (let iy = bounds.minY; iy <= bounds.maxY; iy++) {
        const worldX = bounds.originX + ix * GRID_RESOLUTION;
        const worldY = bounds.originY + iy * GRID_RESOLUTION;
        const inside = pointInPolygon(worldX, worldY, localRing);
        if (!inside && distancePointToRing(worldX, worldY, localRing) > SAFETY_BUFFER_M) continue;
        const key = `${ix},${iy}`;
        if (!grid[key]) grid[key] = {};
        for (let iz = Math.floor(minAlt / GRID_RESOLUTION); iz <= Math.floor(maxAlt / GRID_RESOLUTION); iz++) {
          grid[key][iz] = 'nofly';
        }
      }
    }
  }
}

function normalizeAvoidanceZones(zones) {
  if (!zones || !Array.isArray(zones)) return [];
  return zones.map(z => {
    if (typeof z === 'string') {
      try { return JSON.parse(z); } catch { return null; }
    }
    return z;
  }).filter(Boolean);
}

function addAvoidanceZones(bounds, grid, avoidanceZones, ref) {
  if (!avoidanceZones || avoidanceZones.length === 0) return;
  for (const rawZone of avoidanceZones) {
    const zone = typeof rawZone === 'string' ? JSON.parse(rawZone) : rawZone;

    if (zone.center_lon !== undefined && zone.radius) {
      const center = lonLatToLocal(zone.center_lon, zone.center_lat, ref);
      const radius = zone.radius || 50;
      const altMin = (zone.altitude || 100) - 50;
      const altMax = (zone.altitude || 100) + 50;
      const radiusCells = Math.ceil(radius / GRID_RESOLUTION);

      const cx = Math.round((center.x - bounds.originX) / GRID_RESOLUTION);
      const cy = Math.round((center.y - bounds.originY) / GRID_RESOLUTION);
      for (let dx = -radiusCells; dx <= radiusCells; dx++) {
        for (let dy = -radiusCells; dy <= radiusCells; dy++) {
          const worldX = bounds.originX + (cx + dx) * GRID_RESOLUTION;
          const worldY = bounds.originY + (cy + dy) * GRID_RESOLUTION;
          if (Math.hypot(worldX - center.x, worldY - center.y) <= radius) {
            const key = `${cx + dx},${cy + dy}`;
            if (!grid[key]) grid[key] = {};
            for (let iz = Math.floor(altMin / GRID_RESOLUTION); iz <= Math.floor(altMax / GRID_RESOLUTION); iz++) {
              grid[key][iz] = 'avoid';
            }
          }
        }
      }
    } else if (zone.type === 'Polygon' && zone.coordinates && zone.coordinates[0]) {
      const ring = zone.coordinates[0];
      const localRing = ring.map(([lon, lat]) => {
        const p = lonLatToLocal(lon, lat, ref);
        return [p.x, p.y];
      });
      const minAlt = zone.min_alt || 0;
      const maxAlt = zone.max_alt || 10000;

      for (let ix = bounds.minX; ix <= bounds.maxX; ix++) {
        for (let iy = bounds.minY; iy <= bounds.maxY; iy++) {
          const worldX = bounds.originX + ix * GRID_RESOLUTION;
          const worldY = bounds.originY + iy * GRID_RESOLUTION;
          if (pointInPolygon(worldX, worldY, localRing)) {
            const key = `${ix},${iy}`;
            if (!grid[key]) grid[key] = {};
            for (let iz = Math.floor(minAlt / GRID_RESOLUTION); iz <= Math.floor(maxAlt / GRID_RESOLUTION); iz++) {
              grid[key][iz] = 'nofly';
            }
          }
        }
      }
    }
  }
}

function astar3D(startLocal, endLocal, grid, bounds) {
  const sx = Math.round((startLocal.x - bounds.originX) / GRID_RESOLUTION);
  const sy = Math.round((startLocal.y - bounds.originY) / GRID_RESOLUTION);
  const sz = Math.round(startLocal.alt / GRID_RESOLUTION);
  const ex = Math.round((endLocal.x - bounds.originX) / GRID_RESOLUTION);
  const ey = Math.round((endLocal.y - bounds.originY) / GRID_RESOLUTION);
  const ez = Math.round(endLocal.alt / GRID_RESOLUTION);

  const key = (x, y, z) => `${x},${y},${z}`;
  const VERTICAL_PENALTY = 4;
  const heur = (x, y, z) => Math.hypot(x - ex, y - ey) + Math.abs(z - ez) * VERTICAL_PENALTY;

  const openSet = new Map();
  const closedSet = new Set();
  const gScore = new Map();
  const cameFrom = new Map();

  const startKey = key(sx, sy, sz);
  gScore.set(startKey, 0);
  openSet.set(startKey, heur(sx, sy, sz));

  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const hCost = Math.hypot(dx, dy);
        const vCost = Math.abs(dz) * VERTICAL_PENALTY;
        neighbors.push([dx, dy, dz, hCost + vCost]);
      }
    }
  }

  let iterations = 0;
  const MAX_ITERATIONS = 200000;

  while (openSet.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    let currentKey = null;
    let minF = Infinity;
    for (const [k, f] of openSet) {
      if (f < minF) { minF = f; currentKey = k; }
    }
    if (!currentKey) break;

    if (currentKey === key(ex, ey, ez)) {
      const path = [];
      let k = currentKey;
      while (k) {
        const [cx, cy, cz] = k.split(',').map(Number);
        path.unshift({
          x: bounds.originX + cx * GRID_RESOLUTION,
          y: bounds.originY + cy * GRID_RESOLUTION,
          alt: cz * GRID_RESOLUTION
        });
        k = cameFrom.get(k);
      }
      return path;
    }

    openSet.delete(currentKey);
    closedSet.add(currentKey);
    const [cx, cy, cz] = currentKey.split(',').map(Number);

    for (const [dx, dy, dz, cost] of neighbors) {
      const nx = cx + dx;
      const ny = cy + dy;
      const nz = cz + dz;

      if (nz < 0) continue;

      const nKey = key(nx, ny, nz);
      if (closedSet.has(nKey)) continue;

      const gridCell = grid[`${nx},${ny}`];
      if (gridCell && (gridCell[nz] === 'nofly' || gridCell[nz] === 'avoid')) continue;

      const maxClimbRate = 5;
      const maxAltChange = Math.ceil((maxClimbRate * 60) / GRID_RESOLUTION);
      if (Math.abs(dz) > maxAltChange) continue;

      const tentativeG = (gScore.get(currentKey) || Infinity) + cost;
      if (tentativeG < (gScore.get(nKey) || Infinity)) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentativeG);
        openSet.set(nKey, tentativeG + heur(nx, ny, nz));
      }
    }
  }

  return null;
}

function smoothPath(path, grid, bounds) {
  if (!path || path.length <= 2) return path;
  const result = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let farthest = i + 1;
    for (let j = path.length - 1; j > i + 1; j--) {
      if (isLineOfSightClear(path[i], path[j], grid, bounds)) {
        farthest = j;
        break;
      }
    }
    result.push(path[farthest]);
    i = farthest;
  }
  return result;
}

function isLineOfSightClear(a, b, grid, bounds) {
  if (!grid || !bounds) return true;
  const steps = Math.max(20, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (GRID_RESOLUTION * 2)));
  for (let t = 1; t < steps; t++) {
    const frac = t / steps;
    const x = a.x + (b.x - a.x) * frac;
    const y = a.y + (b.y - a.y) * frac;
    const alt = a.alt + (b.alt - a.alt) * frac;

    const ix = Math.round((x - bounds.originX) / GRID_RESOLUTION);
    const iy = Math.round((y - bounds.originY) / GRID_RESOLUTION);
    const iz = Math.round(alt / GRID_RESOLUTION);

    const cell = grid[`${ix},${iy}`];
    if (cell && (cell[iz] === 'nofly' || cell[iz] === 'avoid')) {
      return false;
    }
  }
  return true;
}

const SIMPLE_PATHS = {};

const MIN_FLIGHT_ALT = 200;

function applyAltitudeEnvelope(waypoints, startAlt, endAlt) {
  const n = waypoints.length;
  if (n < 2) return waypoints;

  if (n === 2) {
    waypoints[0][2] = startAlt;
    waypoints[1][2] = endAlt;
    return waypoints;
  }

  const climbSteps = Math.max(2, Math.floor(n * 0.15));
  const descentSteps = Math.max(2, Math.floor(n * 0.15));
  const cruiseEnd = n - 1 - descentSteps;

  for (let i = 0; i < n; i++) {
    const alt = waypoints[i][2];
    if (i <= climbSteps && climbSteps > 0) {
      waypoints[i][2] = startAlt + (MIN_FLIGHT_ALT - startAlt) * (i / climbSteps);
    } else if (i >= cruiseEnd && descentSteps > 0) {
      const di = i - cruiseEnd;
      waypoints[i][2] = MIN_FLIGHT_ALT + (endAlt - MIN_FLIGHT_ALT) * (di / descentSteps);
    } else {
      waypoints[i][2] = Math.max(alt, MIN_FLIGHT_ALT);
    }
  }
  waypoints[0][2] = startAlt;
  waypoints[n - 1][2] = endAlt;
}

function pointInGeoJSONPolygon(lon, lat, geometry) {
  if (!geometry || !geometry.coordinates || !geometry.coordinates[0]) return false;
  const ring = geometry.coordinates[0];
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pushPointOutOfPolygon(lon, lat, geometry) {
  if (!geometry || !geometry.coordinates || !geometry.coordinates[0]) return { lon, lat };
  const ring = geometry.coordinates[0];
  let centerLon = 0, centerLat = 0;
  for (const [lo, la] of ring) {
    centerLon += lo;
    centerLat += la;
  }
  centerLon /= ring.length;
  centerLat /= ring.length;

  const angle = Math.atan2(lat - centerLat, lon - centerLon);
  let minDist = Infinity;
  let bestLon = lon;
  let bestLat = lat;

  // 按 SAFETY_BUFFER_M (+ 20% 余量) 推出，使绕飞尽量贴近安全线而非过度远离
  const cosLat = Math.cos(centerLat * Math.PI / 180) || 1;
  const pushDistLat = (SAFETY_BUFFER_M * 1.2) / METERS_PER_DEG_LAT;
  const pushDistLon = pushDistLat / cosLat;

  for (let i = 0; i < ring.length; i++) {
    const j = (i + 1) % ring.length;
    const px = ring[i][0], py = ring[i][1];
    const qx = ring[j][0], qy = ring[j][1];
    const dx = qx - px, dy = qy - py;
    let t = ((lon - px) * dx + (lat - py) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const projLon = px + t * dx;
    const projLat = py + t * dy;
    const dist = Math.hypot(lon - projLon, lat - projLat);
    if (dist < minDist) {
      minDist = dist;
      const pushAngle = Math.atan2(lat - projLat, lon - projLon);
      bestLon = projLon + Math.cos(pushAngle) * pushDistLon;
      bestLat = projLat + Math.sin(pushAngle) * pushDistLat;
    }
  }
  return { lon: bestLon, lat: bestLat };
}

function segmentIntersectsAnyZone(ax, ay, bx, by, zones) {
  const steps = Math.max(50, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.0002));
  for (let ti = 0; ti <= steps; ti++) {
    const t = ti / steps;
    const px = ax + (bx - ax) * t;
    const py = ay + (by - ay) * t;
    for (const zone of zones) {
      if (pointInGeoJSONPolygon(px, py, zone)) return true;
    }
  }
  return false;
}

function lineSegmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const det = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(det) < 1e-12) return false;
  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / det;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / det;
  return t > 1e-9 && t < 1 - 1e-9 && u > 1e-9 && u < 1 - 1e-9;
}

function segmentCrossesPolygonEdge(ax, ay, bx, by, ring) {
  for (let i = 0; i < ring.length - 1; i++) {
    if (lineSegmentsIntersect(ax, ay, bx, by, ring[i][0], ring[i][1], ring[i + 1][0], ring[i + 1][1])) {
      return true;
    }
  }
  return false;
}

function segmentVisible(ax, ay, bx, by, zones) {
  for (const zone of zones) {
    const ring = zone.coordinates[0];
    if (segmentCrossesPolygonEdge(ax, ay, bx, by, ring)) return false;
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    if (pointInGeoJSONPolygon(mx, my, zone)) return false;
  }
  return true;
}

function dijkstra(graph, startIdx, endIdx) {
  const n = graph.length;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const visited = new Uint8Array(n);
  dist[startIdx] = 0;

  for (let iter = 0; iter < n; iter++) {
    let u = -1, minD = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < minD) { minD = dist[i]; u = i; }
    }
    if (u === -1 || u === endIdx) break;
    visited[u] = 1;

    for (const [v, w] of graph[u]) {
      const alt = dist[u] + w;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  if (dist[endIdx] === Infinity) return null;
  const path = [];
  let cur = endIdx;
  while (cur !== -1) { path.unshift(cur); cur = prev[cur]; }
  return path;
}

function visibilityGraphPath(startPt, endPt, zones) {
  // 可视图顶点外推距离：由 SAFETY_BUFFER_M (米) 换算为度，并按当前纬度对经度向做投影补偿
  const refLat = (startPt[1] + endPt[1]) / 2;
  const cosLat = Math.cos(refLat * Math.PI / 180) || 1;
  const BUFFER_LAT = SAFETY_BUFFER_M / METERS_PER_DEG_LAT;
  const BUFFER_LON = BUFFER_LAT / cosLat;
  // 旧实现使用各向同性 0.0008° (≈89m)，现在缩小到 ~20m 等效，使绕飞拐角更紧凑
  const BUFFER = Math.max(BUFFER_LAT, BUFFER_LON);
  const vertices = [];
  vertices.push({ x: startPt[0], y: startPt[1] });
  vertices.push({ x: endPt[0], y: endPt[1] });

  for (const zone of zones) {
    const ring = zone.coordinates[0];
    for (let i = 0; i < ring.length - 1; i++) {
      const vx = ring[i][0], vy = ring[i][1];
      let insideAny = false;
      for (const z of zones) {
        if (pointInGeoJSONPolygon(vx, vy, z)) { insideAny = true; break; }
      }
      if (!insideAny) {
        vertices.push({ x: vx, y: vy });
      }

      const dx = ring[i + 1][0] - vx;
      const dy = ring[i + 1][1] - vy;
      const len = Math.hypot(dx, dy);
      if (len < 1e-12) continue;
      const nx = -dy / len, ny = dx / len;

      for (const sign of [1, -1]) {
        const px = vx + nx * BUFFER * sign;
        const py = vy + ny * BUFFER * sign;
        let insideAny = false;
        for (const z of zones) {
          if (pointInGeoJSONPolygon(px, py, z)) { insideAny = true; break; }
        }
        if (!insideAny) {
          vertices.push({ x: px, y: py });
        }
      }
    }
  }

  const n = vertices.length;
  const graph = new Array(n);
  for (let i = 0; i < n; i++) graph[i] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (segmentVisible(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y, zones)) {
        const d = Math.hypot(vertices[j].x - vertices[i].x, vertices[j].y - vertices[i].y);
        graph[i].push([j, d]);
        graph[j].push([i, d]);
      }
    }
  }

  const pathIndices = dijkstra(graph, 0, 1);
  if (!pathIndices) return null;

  return pathIndices.map(idx => [vertices[idx].x, vertices[idx].y, 0]);
}

function generateDirectWaypoints(start, end, avoidanceZones) {
  const zones = normalizeAvoidanceZones(avoidanceZones);
  const key = JSON.stringify({ start, end, avoidanceZones });
  if (SIMPLE_PATHS[key]) return SIMPLE_PATHS[key];

  const startAlt = start[2] || 0;
  const endAlt = end[2] || 0;

  const geoZones = zones.filter(z => z.type === 'Polygon' && z.coordinates && z.coordinates[0]);
  const circleZones = zones.filter(z => z.center_lon !== undefined && z.radius);

  if (geoZones.length === 0 && circleZones.length === 0) {
    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        0
      ]);
    }
    applyAltitudeEnvelope(points, startAlt, endAlt);
    SIMPLE_PATHS[key] = points;
    return points;
  }

  let waypoints;
  if (geoZones.length > 0) {
    const vgPath = visibilityGraphPath(start, end, geoZones);
    if (vgPath && vgPath.length >= 2) {
      waypoints = vgPath;
    } else {
      waypoints = [[start[0], start[1], 0], [end[0], end[1], 0]];
    }
  } else {
    waypoints = [[start[0], start[1], 0], [end[0], end[1], 0]];
  }

  const allPoints = [];
  for (let seg = 0; seg < waypoints.length - 1; seg++) {
    const s = waypoints[seg];
    const e2 = waypoints[seg + 1];
    const steps = Math.max(5, Math.round(Math.hypot(e2[0] - s[0], e2[1] - s[1]) / 0.001));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      allPoints.push([
        s[0] + (e2[0] - s[0]) * t,
        s[1] + (e2[1] - s[1]) * t,
        0
      ]);
    }
  }

  for (let i = 0; i < allPoints.length; i++) {
    for (const zone of geoZones) {
      if (pointInGeoJSONPolygon(allPoints[i][0], allPoints[i][1], zone)) {
        const pushed = pushPointOutOfPolygon(allPoints[i][0], allPoints[i][1], zone);
        allPoints[i] = [pushed.lon, pushed.lat, allPoints[i][2]];
      }
    }
    for (const zone of circleZones) {
      const cosLat = Math.cos(allPoints[i][1] * Math.PI / 180) || 1;
      const dx = allPoints[i][0] - zone.center_lon;
      const dy = allPoints[i][1] - zone.center_lat;
      const dist = Math.hypot(dx * METERS_PER_DEG_LAT * cosLat, dy * METERS_PER_DEG_LAT);
      // 进入 "半径 + 安全冗余" 的扩展圆才推出，并精确推到 radius + SAFETY_BUFFER_M 处 (贴边走最短)
      const safeRadius = zone.radius + SAFETY_BUFFER_M;
      if (dist < safeRadius) {
        const angle = Math.atan2(dy * METERS_PER_DEG_LAT, dx * METERS_PER_DEG_LAT * cosLat);
        const targetLon = zone.center_lon + (safeRadius * Math.cos(angle)) / (METERS_PER_DEG_LAT * cosLat);
        const targetLat = zone.center_lat + (safeRadius * Math.sin(angle)) / METERS_PER_DEG_LAT;
        allPoints[i] = [targetLon, targetLat, allPoints[i][2]];
      }
    }
  }

  applyAltitudeEnvelope(allPoints, startAlt, endAlt);
  SIMPLE_PATHS[key] = allPoints;
  return allPoints;
}

function planRoute(start, end, avoidanceZones = []) {
  const ref = { lon: start[0], lat: start[1] };
  const startLocal = lonLatToLocal(start[0], start[1], ref);
  startLocal.alt = start[2] || 0;
  const endLocal = lonLatToLocal(end[0], end[1], ref);
  endLocal.alt = end[2] || 0;

  const cruiseAlt = Math.max(startLocal.alt, endLocal.alt, MIN_FLIGHT_ALT);

  const margin = 500;
  const minX = Math.floor((Math.min(startLocal.x, endLocal.x) - margin) / GRID_RESOLUTION) * GRID_RESOLUTION;
  const maxX = Math.ceil((Math.max(startLocal.x, endLocal.x) + margin) / GRID_RESOLUTION) * GRID_RESOLUTION;
  const minY = Math.floor((Math.min(startLocal.y, endLocal.y) - margin) / GRID_RESOLUTION) * GRID_RESOLUTION;
  const maxY = Math.ceil((Math.max(startLocal.y, endLocal.y) + margin) / GRID_RESOLUTION) * GRID_RESOLUTION;

  const bounds = {
    originX: minX,
    originY: minY,
    minX: 0,
    maxX: Math.round((maxX - minX) / GRID_RESOLUTION),
    minY: 0,
    maxY: Math.round((maxY - minY) / GRID_RESOLUTION)
  };

  const grid = {};
  loadNoFlyZonesAsGrid(bounds, grid, ref);
  addAvoidanceZones(bounds, grid, avoidanceZones, ref);

  const startAstar = { x: startLocal.x, y: startLocal.y, alt: startLocal.alt };
  const endAstar = { x: endLocal.x, y: endLocal.y, alt: cruiseAlt };
  const path = astar3D(startAstar, endAstar, grid, bounds);

  if (path) {
    // 二次平滑：先大跨度合并直线段，再做一次贪心剔除冗余拐点，进一步缩短路径
    let smoothed = smoothPath(path, grid, bounds);
    smoothed = smoothPath(smoothed, grid, bounds);
    const waypoints = smoothed.map(p => {
      const ll = localToLonLat(p.x, p.y, ref);
      return [ll.lon, ll.lat, p.alt];
    });
    applyAltitudeEnvelope(waypoints, start[2] || 0, end[2] || 0);
    return {
      type: 'LineString',
      coordinates: waypoints
    };
  }

  const fallback = generateDirectWaypoints(start, end, avoidanceZones);
  return {
    type: 'LineString',
    coordinates: fallback
  };
}

function planRouteDirect(start, end, avoidanceZones = []) {
  const result = planRoute(start, end, avoidanceZones);
  return result;
}

function replanRoute(planId, avoidanceZones) {
  const planService = require('./planService');
  const plan = planService.getPlan(planId);
  if (!plan) return null;

  const start = [plan.start_lon, plan.start_lat, plan.start_alt];
  const end = [plan.end_lon, plan.end_lat, plan.end_alt];

  const result = planRouteDirect(start, end, avoidanceZones);
  planService.updatePlan(planId, { waypoints: result, status: 'modified' });
  return result;
}

module.exports = { planRoute, planRouteDirect, replanRoute };
