const { queryAll } = require('../database');

const EARTH_RADIUS = 6378137;
const GRID_RESOLUTION = 10;

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

function addAvoidanceZones(bounds, grid, avoidanceZones, ref) {
  if (!avoidanceZones || avoidanceZones.length === 0) return;
  for (const zone of avoidanceZones) {
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
  const heur = (x, y, z) => Math.hypot(x - ex, y - ey, (z - ez) * 0.5);

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
        neighbors.push([dx, dy, dz, Math.hypot(dx, dy, dz * 0.5)]);
      }
    }
  }

  let iterations = 0;
  const MAX_ITERATIONS = 50000;

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

function smoothPath(path) {
  if (!path || path.length <= 2) return path;
  const result = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let farthest = i + 1;
    for (let j = path.length - 1; j > i + 1; j--) {
      if (isLineOfSightClear(path[i], path[j], path)) {
        farthest = j;
        break;
      }
    }
    result.push(path[farthest]);
    i = farthest;
  }
  return result;
}

function isLineOfSightClear(a, b, path) {
  const steps = 20;
  for (let t = 1; t < steps; t++) {
    const frac = t / steps;
    const x = a.x + (b.x - a.x) * frac;
    const y = a.y + (b.y - a.y) * frac;
    const alt = a.alt + (b.alt - a.alt) * frac;
    let clear = true;
    for (const p of path) {
      if (Math.hypot(x - p.x, y - p.y) < GRID_RESOLUTION * 0.5 && Math.abs(alt - p.alt) < GRID_RESOLUTION * 0.5) {
        clear = false;
        break;
      }
    }
    if (!clear) return false;
  }
  return true;
}

const SIMPLE_PATHS = {};
function generateDirectWaypoints(start, end, avoidanceZones) {
  const key = JSON.stringify({ start, end, avoidanceZones });
  if (SIMPLE_PATHS[key]) return SIMPLE_PATHS[key];

  const points = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t
    ]);
  }

  if (avoidanceZones && avoidanceZones.length > 0) {
    const modified = [];
    for (let i = 0; i < points.length; i++) {
      let adjusted = false;
      for (const zone of avoidanceZones) {
        const dx = points[i][0] - zone.center_lon;
        const dy = points[i][1] - zone.center_lat;
        const dist = Math.hypot(dx * 111320 * Math.cos(points[i][1] * Math.PI / 180), dy * 111320);
        if (dist < zone.radius) {
          const angle = Math.atan2(dy, dx);
          const pushDist = zone.radius / 111320;
          points[i] = [
            zone.center_lon + Math.cos(angle) * pushDist * 1.5,
            zone.center_lat + Math.sin(angle) * pushDist * 1.5,
            zone.altitude > points[i][2] ? zone.altitude + 20 : points[i][2]
          ];
          adjusted = true;
        }
      }
      modified.push(points[i]);
    }
    SIMPLE_PATHS[key] = modified;
    return modified;
  }

  SIMPLE_PATHS[key] = points;
  return points;
}

function planRoute(start, end, avoidanceZones = []) {
  const ref = { lon: start[0], lat: start[1] };
  const startLocal = lonLatToLocal(start[0], start[1], ref);
  startLocal.alt = start[2];
  const endLocal = lonLatToLocal(end[0], end[1], ref);
  endLocal.alt = end[2];

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

  const path = astar3D(startLocal, endLocal, grid, bounds);

  if (path) {
    const smoothed = smoothPath(path);
    const waypoints = smoothed.map(p => {
      const ll = localToLonLat(p.x, p.y, ref);
      return [ll.lon, ll.lat, p.alt];
    });
    return {
      type: 'LineString',
      coordinates: waypoints
    };
  }

  return {
    type: 'LineString',
    coordinates: [start, end]
  };
}

function planRouteDirect(start, end, avoidanceZones = []) {
  const waypoints = generateDirectWaypoints(start, end, avoidanceZones);
  return {
    type: 'LineString',
    coordinates: waypoints
  };
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
