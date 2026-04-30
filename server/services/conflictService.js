const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');
const planService = require('./planService');

function interpolateWaypoints(waypointsCoords, startTime, endTime, sampleIntervalSec = 1) {
  if (!waypointsCoords || waypointsCoords.length < 2) return [];

  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();
  const totalDuration = (endMs - startMs) / 1000;
  if (totalDuration <= 0) return [];

  const segments = [];
  let cumulativeDist = 0;
  const dists = [0];
  for (let i = 1; i < waypointsCoords.length; i++) {
    const prev = waypointsCoords[i - 1];
    const curr = waypointsCoords[i];
    const dLon = (curr[0] - prev[0]) * 111320 * Math.cos((prev[1] + curr[1]) / 2 * Math.PI / 180);
    const dLat = (curr[1] - prev[1]) * 111320;
    const dAlt = (curr[2] || 0) - (prev[2] || 0);
    const segDist = Math.hypot(dLon, dLat, dAlt);
    cumulativeDist += segDist;
    dists.push(cumulativeDist);
    segments.push({ prev: i - 1, curr: i, dist: segDist, cumulative: cumulativeDist });
  }
  if (cumulativeDist === 0) cumulativeDist = 1;

  const numSamples = Math.max(2, Math.ceil(totalDuration / sampleIntervalSec));
  const samples = [];
  for (let i = 0; i < numSamples; i++) {
    const t = i / (numSamples - 1);
    const targetDist = t * cumulativeDist;

    let segIdx = 0;
    for (let s = 0; s < segments.length; s++) {
      if (targetDist <= segments[s].cumulative) {
        segIdx = s;
        break;
      }
    }

    const seg = segments[segIdx];
    const segStartDist = segIdx === 0 ? 0 : segments[segIdx - 1].cumulative;
    const segFrac = seg.dist > 0 ? (targetDist - segStartDist) / seg.dist : 0;

    const p1 = waypointsCoords[seg.prev];
    const p2 = waypointsCoords[seg.curr];
    const lon = p1[0] + (p2[0] - p1[0]) * segFrac;
    const lat = p1[1] + (p2[1] - p1[1]) * segFrac;
    const alt = (p1[2] || 0) + ((p2[2] || 0) - (p1[2] || 0)) * segFrac;
    const time = new Date(startMs + t * totalDuration * 1000).toISOString();

    samples.push({ time, lon, lat, alt });
  }
  return samples;
}

function distance3D(a, b) {
  const dLon = (a.lon - b.lon) * 111320 * Math.cos((a.lat + b.lat) / 2 * Math.PI / 180);
  const dLat = (a.lat - b.lat) * 111320;
  const dAlt = a.alt - b.alt;
  return Math.hypot(dLon, dLat, dAlt);
}

function detectConflict(plan1, plan2, threshold = 15) {
  const wp1 = parseWaypoints(plan1.waypoints);
  const wp2 = parseWaypoints(plan2.waypoints);

  if (!wp1 || !wp2) return null;

  const samples1 = interpolateWaypoints(wp1, plan1.start_time, plan1.end_time, 1);
  const samples2 = interpolateWaypoints(wp2, plan2.start_time, plan2.end_time, 1);

  if (samples1.length === 0 || samples2.length === 0) return null;

  let minDist = Infinity;
  let minDistInfo = null;
  const conflictSegments = [];

  for (const s1 of samples1) {
    const t1 = new Date(s1.time).getTime();
    for (const s2 of samples2) {
      const t2 = new Date(s2.time).getTime();
      if (Math.abs(t1 - t2) > 5000) continue;

      const dist = distance3D(s1, s2);
      if (dist < threshold) {
        const midLon = (s1.lon + s2.lon) / 2;
        const midLat = (s1.lat + s2.lat) / 2;
        const midAlt = (s1.alt + s2.alt) / 2;
        const conflictTime = new Date((t1 + t2) / 2).toISOString();
        conflictSegments.push({ time: conflictTime, lon: midLon, lat: midLat, alt: midAlt, distance: dist });
      }
      if (dist < minDist) {
        minDist = dist;
        minDistInfo = { time: new Date((t1 + t2) / 2).toISOString(), lon: (s1.lon + s2.lon) / 2, lat: (s1.lat + s2.lat) / 2, alt: (s1.alt + s2.alt) / 2, distance: dist };
      }
    }
  }

  if (conflictSegments.length === 0) return null;

  const sortedSegments = conflictSegments.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const mergedWindows = [];
  let currentWindow = { start: sortedSegments[0].time, end: sortedSegments[0].time, segments: [sortedSegments[0]], minDist: sortedSegments[0].distance };
  for (let i = 1; i < sortedSegments.length; i++) {
    const seg = sortedSegments[i];
    const prevEnd = new Date(currentWindow.end).getTime();
    const curStart = new Date(seg.time).getTime();
    if (curStart - prevEnd <= 10000) {
      currentWindow.end = seg.time;
      currentWindow.segments.push(seg);
      if (seg.distance < currentWindow.minDist) currentWindow.minDist = seg.distance;
    } else {
      mergedWindows.push(currentWindow);
      currentWindow = { start: seg.time, end: seg.time, segments: [seg], minDist: seg.distance };
    }
  }
  mergedWindows.push(currentWindow);

  let severity;
  if (minDistInfo.distance < 3) severity = 'high';
  else if (minDistInfo.distance < 5) severity = 'medium';
  else severity = 'low';

  return {
    type: 'time_space',
    severity,
    involved_plans: [plan1.id, plan2.id],
    time_windows: mergedWindows.map(w => ({ start: w.start, end: w.end })),
    conflict_point: { lon: minDistInfo.lon, lat: minDistInfo.lat, alt: minDistInfo.alt },
    min_distance: minDistInfo.distance,
    all_segments: mergedWindows
  };
}

function parseWaypoints(waypoints) {
  if (!waypoints) return null;
  try {
    const wp = typeof waypoints === 'string' ? JSON.parse(waypoints) : waypoints;
    if (wp.coordinates) return wp.coordinates;
    if (Array.isArray(wp)) return wp;
    return null;
  } catch {
    return null;
  }
}

function detectGlobal(timeRange = {}) {
  const plans = planService.listPlans({ status: 'active' });
  const existingConflicts = queryAll('SELECT * FROM conflict_events WHERE status != ?', ['resolved']);
  const existingPairs = new Set();

  for (const c of existingConflicts) {
    const involved = JSON.parse(c.involved_plans);
    existingPairs.add(involved.sort().join(','));
  }

  const results = [];
  for (let i = 0; i < plans.length; i++) {
    for (let j = i + 1; j < plans.length; j++) {
      const pairKey = [plans[i].id, plans[j].id].sort().join(',');
      if (existingPairs.has(pairKey)) continue;

      const conflict = detectConflict(plans[i], plans[j]);
      if (conflict) {
        const conflictId = uuidv4();
        const timeWindowStart = conflict.time_windows[0].start;
        const timeWindowEnd = conflict.time_windows[conflict.time_windows.length - 1].end;

        run(
          `INSERT INTO conflict_events (id, type, severity, involved_plans, time_window_start, time_window_end,
           conflict_point_lon, conflict_point_lat, conflict_alt, distance, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [conflictId, conflict.type, conflict.severity, JSON.stringify(conflict.involved_plans),
           timeWindowStart, timeWindowEnd,
           conflict.conflict_point.lon, conflict.conflict_point.lat, conflict.conflict_point.alt,
           conflict.min_distance, 'unresolved']
        );

        for (const planId of conflict.involved_plans) {
          run(
            `INSERT INTO conflict_details (id, conflict_event_id, plan_id, involved_segment_start_time, involved_segment_end_time)
             VALUES (?,?,?,?,?)`,
            [uuidv4(), conflictId, planId, timeWindowStart, timeWindowEnd]
          );
        }

        results.push(queryOne('SELECT * FROM conflict_events WHERE id = ?', [conflictId]));
      }
    }
  }
  return results;
}

function detectPair(planId1, planId2) {
  const plan1 = planService.getPlan(planId1);
  const plan2 = planService.getPlan(planId2);
  if (!plan1 || !plan2) return null;
  return detectConflict(plan1, plan2);
}

function listConflicts() {
  return queryAll('SELECT * FROM conflict_events ORDER BY created_at DESC');
}

function getConflict(id) {
  const conflict = queryOne('SELECT * FROM conflict_events WHERE id = ?', [id]);
  if (!conflict) return null;
  const details = queryAll('SELECT * FROM conflict_details WHERE conflict_event_id = ?', [id]);
  return { ...conflict, details };
}

function updateConflictStatus(id, status) {
  run('UPDATE conflict_events SET status = ? WHERE id = ?', [status, id]);
  return queryOne('SELECT * FROM conflict_events WHERE id = ?', [id]);
}

function deleteConflict(id) {
  run('DELETE FROM conflict_details WHERE conflict_event_id = ?', [id]);
  run('DELETE FROM conflict_events WHERE id = ?', [id]);
}

module.exports = { detectGlobal, detectPair, listConflicts, getConflict, updateConflictStatus, deleteConflict };
