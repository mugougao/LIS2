const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_PLANS = [
  {
    id: 'plan-qh-conflict-a',
    operator_id: 'op-a',
    plan_name: '前海物流巡检 A 线',
    start_time: '2026-06-19T10:00:00.000Z',
    end_time: '2026-06-19T10:10:00.000Z',
    start_lon: 113.8720,
    start_lat: 22.5200,
    start_alt: 120,
    end_lon: 113.9020,
    end_lat: 22.5400,
    end_alt: 120,
    aircraft_type: '多旋翼无人机',
    waypoints: {
      type: 'LineString',
      coordinates: [
        [113.8720, 22.5200, 120],
        [113.8870, 22.5300, 120],
        [113.9020, 22.5400, 120]
      ]
    },
    time_flexible: 1,
    alt_flexible: 1,
    interruptible: 1,
    unstructured_notes: '默认演示计划：与 B 线在前海核心区同高度同时间交叉。'
  },
  {
    id: 'plan-qh-conflict-b',
    operator_id: 'op-b',
    plan_name: '前海医疗配送 B 线',
    start_time: '2026-06-19T10:00:00.000Z',
    end_time: '2026-06-19T10:10:00.000Z',
    start_lon: 113.9020,
    start_lat: 22.5200,
    start_alt: 120,
    end_lon: 113.8720,
    end_lat: 22.5400,
    end_alt: 120,
    aircraft_type: '多旋翼无人机',
    waypoints: {
      type: 'LineString',
      coordinates: [
        [113.9020, 22.5200, 120],
        [113.8870, 22.5300, 120],
        [113.8720, 22.5400, 120]
      ]
    },
    time_flexible: 1,
    alt_flexible: 1,
    interruptible: 0,
    unstructured_notes: '默认演示计划：任务优先级高，尽量不调整时间。'
  },
  {
    id: 'plan-qh-support-c',
    operator_id: 'op-c',
    plan_name: '前海湾岸线巡查 C 线',
    start_time: '2026-06-19T10:05:00.000Z',
    end_time: '2026-06-19T10:18:00.000Z',
    start_lon: 113.8580,
    start_lat: 22.5260,
    start_alt: 160,
    end_lon: 113.9040,
    end_lat: 22.5160,
    end_alt: 160,
    aircraft_type: '多旋翼无人机',
    waypoints: {
      type: 'LineString',
      coordinates: [
        [113.8580, 22.5260, 160],
        [113.8800, 22.5210, 160],
        [113.9040, 22.5160, 160]
      ]
    },
    time_flexible: 1,
    alt_flexible: 1,
    interruptible: 1,
    unstructured_notes: '默认演示计划：用于展示规划管理的非冲突航线。'
  }
];

function listPlans(filters = {}) {
  let sql = 'SELECT * FROM flight_plans WHERE 1=1';
  const params = [];
  if (filters.operator_id) {
    sql += ' AND operator_id = ?';
    params.push(filters.operator_id);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  sql += ' ORDER BY created_at DESC';
  return queryAll(sql, params);
}

function getPlan(id) {
  return queryOne('SELECT * FROM flight_plans WHERE id = ?', [id]);
}

function createPlan(data) {
  const id = data.id || uuidv4();
  const {
    operator_id, plan_name, start_time, start_lon, start_lat, start_alt,
    end_time, end_lon, end_lat, end_alt, aircraft_type, waypoints,
    time_flexible = 1, alt_flexible = 1, interruptible = 1,
    unstructured_notes
  } = data;
  run(
    `INSERT INTO flight_plans (id, operator_id, plan_name, start_time, start_lon, start_lat, start_alt,
     end_time, end_lon, end_lat, end_alt, aircraft_type, waypoints,
     time_flexible, alt_flexible, interruptible, unstructured_notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, operator_id, plan_name, start_time, start_lon, start_lat, start_alt,
     end_time || null, end_lon || null, end_lat || null, end_alt || null,
     aircraft_type || null, waypoints ? JSON.stringify(waypoints) : null,
     time_flexible, alt_flexible, interruptible, unstructured_notes || null]
  );
  return getPlan(id);
}

function ensureDefaultPlans() {
  for (const plan of DEFAULT_PLANS) {
    const existing = getPlan(plan.id);
    if (existing) {
      updatePlan(plan.id, { ...plan, status: 'active' });
    } else {
      createPlan(plan);
    }
  }
}

function updatePlan(id, data) {
  const existing = getPlan(id);
  if (!existing) return null;
  const updated = {
    plan_name: data.plan_name ?? existing.plan_name,
    start_time: data.start_time ?? existing.start_time,
    start_lon: data.start_lon ?? existing.start_lon,
    start_lat: data.start_lat ?? existing.start_lat,
    start_alt: data.start_alt ?? existing.start_alt,
    end_time: data.end_time ?? existing.end_time,
    end_lon: data.end_lon ?? existing.end_lon,
    end_lat: data.end_lat ?? existing.end_lat,
    end_alt: data.end_alt ?? existing.end_alt,
    aircraft_type: data.aircraft_type ?? existing.aircraft_type,
    waypoints: data.waypoints ?? existing.waypoints,
    time_flexible: data.time_flexible ?? existing.time_flexible,
    alt_flexible: data.alt_flexible ?? existing.alt_flexible,
    interruptible: data.interruptible ?? existing.interruptible,
    unstructured_notes: data.unstructured_notes ?? existing.unstructured_notes,
    status: data.status ?? existing.status,
    updated_at: new Date().toISOString()
  };
  const wp = updated.waypoints ? (typeof updated.waypoints === 'string' ? updated.waypoints : JSON.stringify(updated.waypoints)) : null;
  run(
    `UPDATE flight_plans SET plan_name=?, start_time=?, start_lon=?, start_lat=?, start_alt=?,
     end_time=?, end_lon=?, end_lat=?, end_alt=?, aircraft_type=?, waypoints=?,
     time_flexible=?, alt_flexible=?, interruptible=?, unstructured_notes=?,
     status=?, updated_at=? WHERE id=?`,
    [updated.plan_name, updated.start_time, updated.start_lon, updated.start_lat, updated.start_alt,
     updated.end_time, updated.end_lon, updated.end_lat, updated.end_alt,
     updated.aircraft_type, wp,
     updated.time_flexible, updated.alt_flexible, updated.interruptible,
     updated.unstructured_notes, updated.status, updated.updated_at, id]
  );
  return getPlan(id);
}

function deletePlan(id) {
  const existing = getPlan(id);
  if (!existing) return false;
  run('DELETE FROM flight_plans WHERE id = ?', [id]);
  return true;
}

function getPlansByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return queryAll(`SELECT * FROM flight_plans WHERE id IN (${placeholders})`, ids);
}

module.exports = { listPlans, getPlan, createPlan, updatePlan, deletePlan, getPlansByIds, ensureDefaultPlans };
