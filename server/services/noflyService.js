const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');

function listNoFlyZones() {
  return queryAll('SELECT * FROM no_fly_zones ORDER BY created_at DESC');
}

function getNoFlyZone(id) {
  return queryOne('SELECT * FROM no_fly_zones WHERE id = ?', [id]);
}

function createNoFlyZone(data) {
  const id = data.id || uuidv4();
  const { name, geometry, min_alt, max_alt, start_time, end_time } = data;
  run(
    `INSERT INTO no_fly_zones (id, name, geometry, min_alt, max_alt, start_time, end_time)
     VALUES (?,?,?,?,?,?,?)`,
    [id, name || null, JSON.stringify(geometry), min_alt || null, max_alt || null,
     start_time || null, end_time || null]
  );
  return getNoFlyZone(id);
}

function updateNoFlyZone(id, data) {
  const existing = getNoFlyZone(id);
  if (!existing) return null;
  const updated = {
    name: data.name ?? existing.name,
    geometry: data.geometry ? JSON.stringify(data.geometry) : existing.geometry,
    min_alt: data.min_alt ?? existing.min_alt,
    max_alt: data.max_alt ?? existing.max_alt,
    start_time: data.start_time ?? existing.start_time,
    end_time: data.end_time ?? existing.end_time
  };
  run(
    `UPDATE no_fly_zones SET name=?, geometry=?, min_alt=?, max_alt=?, start_time=?, end_time=? WHERE id=?`,
    [updated.name, updated.geometry, updated.min_alt, updated.max_alt,
     updated.start_time, updated.end_time, id]
  );
  return getNoFlyZone(id);
}

function deleteNoFlyZone(id) {
  const existing = getNoFlyZone(id);
  if (!existing) return false;
  run('DELETE FROM no_fly_zones WHERE id = ?', [id]);
  return true;
}

module.exports = { listNoFlyZones, getNoFlyZone, createNoFlyZone, updateNoFlyZone, deleteNoFlyZone };
