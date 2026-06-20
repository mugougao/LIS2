const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_NO_FLY_ZONES = [
  {
    id: 'nofly-mock-c07',
    name: 'C07 禁飞区',
    min_alt: 0,
    max_alt: 120,
    start_time: '2026-06-19T00:20:00.000Z',
    end_time: '2026-06-19T12:14:00.000Z',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [113.949741289776767, 22.524058890738285], [113.949767002850948, 22.524225152181096],
        [113.949824857267814, 22.524527985009261], [113.949953422638657, 22.524783314132915],
        [113.950088416278064, 22.526879370263575], [113.950284478468589, 22.534571564331038],
        [113.950721600729494, 22.535379056574385], [113.954167152668191, 22.541078867504091],
        [113.954501422632362, 22.542266298494955], [113.954601060794801, 22.543349820361129],
        [113.954543206377906, 22.544501609621236], [113.954501422632362, 22.545163587243309],
        [113.954552848780722, 22.545876025979791], [113.955169962560788, 22.548701996739471],
        [113.955108894009641, 22.549346143740117], [113.953945377403471, 22.5512577881025],
        [113.953395760443087, 22.552952717706365], [113.953215768923926, 22.556277212667947],
        [113.9617782226223, 22.556502800494723], [113.959804744179806, 22.543293418062881],
        [113.959174773862657, 22.538591166464329], [113.959341908844763, 22.534577501791258],
        [113.95877622, 22.52324836], [113.949741289776767, 22.524058890738285]
      ]]
    }
  },
  {
    id: 'nofly-mock-c03',
    name: 'C03 禁飞区',
    min_alt: 200,
    max_alt: 500,
    start_time: null,
    end_time: null,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [113.961781436756567, 22.556487959201679], [113.964709513077594, 22.557176593517557],
        [113.965648040284805, 22.557319069153682], [113.967242250883302, 22.557461544642635],
        [113.96926072720558, 22.55733094211671], [113.970417815543215, 22.557307196189619],
        [113.971034929323324, 22.55645234009183], [113.974130848630352, 22.553933702497741],
        [113.972423435328437, 22.55224922055605], [113.970083545579044, 22.552700409014392],
        [113.967512238162087, 22.552605422093141], [113.966972263604518, 22.552557928607996],
        [113.967059045229874, 22.540651389846936], [113.959806351246939, 22.543291933791565],
        [113.961781436756567, 22.556487959201679]
      ]]
    }
  }
];

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

function ensureDefaultNoFlyZones() {
  for (const zone of DEFAULT_NO_FLY_ZONES) {
    const existing = getNoFlyZone(zone.id);
    const data = {
      ...zone,
      geometry: JSON.parse(JSON.stringify(zone.geometry))
    };
    if (existing) {
      updateNoFlyZone(zone.id, data);
    } else {
      createNoFlyZone(data);
    }
  }
}

module.exports = { listNoFlyZones, getNoFlyZone, createNoFlyZone, updateNoFlyZone, deleteNoFlyZone, ensureDefaultNoFlyZones };
