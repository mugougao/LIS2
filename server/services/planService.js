const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');

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

module.exports = { listPlans, getPlan, createPlan, updatePlan, deletePlan, getPlansByIds };
