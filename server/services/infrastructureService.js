const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');

const FACILITY_TYPES = ['5ga', 'radar', 'counter_uas', 'communication', 'identification'];

const TYPE_LABELS = {
  '5ga': '5G-A通感站',
  radar: '低空雷达',
  counter_uas: '反无人机装置',
  communication: '通信保障装置',
  identification: '识别装置'
};

const STATUS_LABELS = {
  online: '在线',
  offline: '离线',
  fault: '故障',
  maintenance: '维护中'
};

const MAX_COVERAGE_RADIUS = 2000;
const LEGACY_AIRPORT_FACILITY_IDS = [
  'FAC-RAD-BA-001',
  'FAC-RAD-BA-002',
  'FAC-CUAS-BA-001',
  'FAC-CUAS-BA-002',
  'FAC-CUAS-BA-003'
];

const CREATE_SQL = [
  `CREATE TABLE IF NOT EXISTS infrastructure_facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subtype TEXT,
    model TEXT,
    owner_unit TEXT,
    maintenance_unit TEXT,
    lon REAL NOT NULL,
    lat REAL NOT NULL,
    alt REAL DEFAULT 0,
    status TEXT DEFAULT 'online',
    health_score INTEGER DEFAULT 100,
    coverage_radius REAL DEFAULT 1000,
    min_alt REAL DEFAULT 0,
    max_alt REAL DEFAULT 300,
    coverage_shape TEXT DEFAULT 'circle',
    coverage_geometry TEXT,
    capabilities TEXT,
    metrics TEXT,
    last_seen_at TEXT,
    last_maintenance_time TEXT,
    next_maintenance_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS facility_status_snapshots (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    status TEXT NOT NULL,
    health_score INTEGER,
    metrics TEXT,
    recorded_at TEXT NOT NULL,
    FOREIGN KEY (facility_id) REFERENCES infrastructure_facilities(id)
  )`,
  `CREATE TABLE IF NOT EXISTS facility_alerts (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'new',
    occurred_at TEXT NOT NULL,
    acknowledged_at TEXT,
    resolved_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES infrastructure_facilities(id)
  )`,
  `CREATE TABLE IF NOT EXISTS maintenance_orders (
    id TEXT PRIMARY KEY,
    facility_id TEXT NOT NULL,
    alert_id TEXT,
    order_type TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    assignee TEXT,
    description TEXT,
    result TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (facility_id) REFERENCES infrastructure_facilities(id),
    FOREIGN KEY (alert_id) REFERENCES facility_alerts(id)
  )`
];

const SAMPLE_FACILITIES = [
  {
    id: 'FAC-5GA-001',
    name: '深圳湾5G-A通感站01',
    type: '5ga',
    subtype: '通感一体基站',
    model: '5GA-Sense-X1',
    owner_unit: '低空监管中心',
    maintenance_unit: '移动低空保障队',
    lon: 113.9589,
    lat: 22.5236,
    alt: 32,
    status: 'online',
    health_score: 96,
    coverage_radius: 1800,
    min_alt: 0,
    max_alt: 600,
    capabilities: ['communication', 'sensing'],
    metrics: { latency_ms: 18, uplink_mbps: 420, load_percent: 47, connected_targets: 23 },
    next_maintenance_time: '2026-07-03T09:00:00.000Z'
  },
  {
    id: 'FAC-RAD-002',
    name: '前海低空补盲雷达02',
    type: 'radar',
    subtype: '低空监视雷达',
    model: 'LAR-3000',
    owner_unit: '空域管理中心',
    maintenance_unit: '雷达运维一组',
    lon: 113.8958,
    lat: 22.5335,
    alt: 48,
    status: 'online',
    health_score: 91,
    coverage_radius: 2000,
    min_alt: 20,
    max_alt: 1000,
    capabilities: ['surveillance'],
    metrics: { refresh_rate_s: 2, track_quality: 0.92, targets: 18, blind_zone_count: 1 },
    next_maintenance_time: '2026-07-10T02:00:00.000Z'
  },
  {
    id: 'FAC-CUAS-003',
    name: '核心区反无人机处置点03',
    type: 'counter_uas',
    subtype: '导航诱骗/压制一体机',
    model: 'CUAS-GD-800',
    owner_unit: '安保联动中心',
    maintenance_unit: '反制设备保障队',
    lon: 113.9932,
    lat: 22.5312,
    alt: 26,
    status: 'online',
    health_score: 88,
    coverage_radius: 1800,
    min_alt: 0,
    max_alt: 300,
    capabilities: ['countermeasure'],
    metrics: { standby: true, power_percent: 72, authorized: true, response_level: 2 },
    next_maintenance_time: '2026-06-28T09:30:00.000Z'
  },
  {
    id: 'FAC-COM-004',
    name: '应急通信保障车04',
    type: 'communication',
    subtype: '移动通信车',
    model: 'ECV-200',
    owner_unit: '应急通信中心',
    maintenance_unit: '通信保障二组',
    lon: 113.9545,
    lat: 22.5442,
    alt: 20,
    status: 'maintenance',
    health_score: 66,
    coverage_radius: 1800,
    min_alt: 0,
    max_alt: 500,
    capabilities: ['communication'],
    metrics: { packet_loss_percent: 1.8, bandwidth_mbps: 180, backup_link: 'standby', battery_percent: 58 },
    next_maintenance_time: '2026-06-20T01:30:00.000Z'
  },
  {
    id: 'FAC-ID-005',
    name: 'Remote ID接收站05',
    type: 'identification',
    subtype: 'Remote ID/北斗识别',
    model: 'RID-BD-1200',
    owner_unit: '低空监管中心',
    maintenance_unit: '识别设备运维组',
    lon: 113.9704,
    lat: 22.5572,
    alt: 35,
    status: 'online',
    health_score: 93,
    coverage_radius: 1900,
    min_alt: 0,
    max_alt: 800,
    capabilities: ['identification'],
    metrics: { identify_rate: 0.97, remote_id_quality: 0.94, active_targets: 16, noise_floor: -91 },
    next_maintenance_time: '2026-07-12T08:00:00.000Z'
  },
  {
    id: 'FAC-RAD-006',
    name: '蛇口相控阵雷达06',
    type: 'radar',
    subtype: '相控阵雷达',
    model: 'PAR-LA-5000',
    owner_unit: '空域管理中心',
    maintenance_unit: '雷达运维二组',
    lon: 114.0168,
    lat: 22.5161,
    alt: 62,
    status: 'fault',
    health_score: 42,
    coverage_radius: 2000,
    min_alt: 50,
    max_alt: 1200,
    capabilities: ['surveillance'],
    metrics: { refresh_rate_s: 8, track_quality: 0.48, targets: 4, blind_zone_count: 5 },
    next_maintenance_time: '2026-06-19T12:00:00.000Z'
  },
  {
    id: 'FAC-RAD-QH-001',
    name: '前海桂湾低空补盲雷达01',
    type: 'radar',
    subtype: '低空补盲雷达',
    model: 'LAR-QH-1800',
    owner_unit: '前海低空保障中心',
    maintenance_unit: '雷达运维前海组',
    lon: 113.8918,
    lat: 22.5272,
    alt: 42,
    status: 'online',
    health_score: 94,
    coverage_radius: 1800,
    min_alt: 20,
    max_alt: 900,
    capabilities: ['surveillance'],
    metrics: { refresh_rate_s: 2, track_quality: 0.95, targets: 21, blind_zone_count: 0 },
    next_maintenance_time: '2026-07-06T02:00:00.000Z'
  },
  {
    id: 'FAC-RAD-QH-002',
    name: '前海妈湾相控阵雷达02',
    type: 'radar',
    subtype: '重点区域监视雷达',
    model: 'PAR-QH-2000',
    owner_unit: '前海低空保障中心',
    maintenance_unit: '雷达运维前海组',
    lon: 113.8765,
    lat: 22.5036,
    alt: 38,
    status: 'online',
    health_score: 90,
    coverage_radius: 2000,
    min_alt: 30,
    max_alt: 1000,
    capabilities: ['surveillance'],
    metrics: { refresh_rate_s: 3, track_quality: 0.9, targets: 17, blind_zone_count: 1 },
    next_maintenance_time: '2026-07-08T02:00:00.000Z'
  },
  {
    id: 'FAC-CUAS-QH-001',
    name: '前海桂湾反无人机01',
    type: 'counter_uas',
    subtype: '导航诱骗/定向压制',
    model: 'CUAS-QH-1200',
    owner_unit: '前海安保联动中心',
    maintenance_unit: '反制设备前海组',
    lon: 113.8941,
    lat: 22.5344,
    alt: 28,
    status: 'online',
    health_score: 92,
    coverage_radius: 1200,
    min_alt: 0,
    max_alt: 300,
    capabilities: ['countermeasure'],
    metrics: { standby: true, power_percent: 86, authorized: true, response_level: 2 },
    next_maintenance_time: '2026-06-30T09:00:00.000Z'
  },
  {
    id: 'FAC-CUAS-QH-002',
    name: '前海妈湾反无人机02',
    type: 'counter_uas',
    subtype: '干扰压制设备',
    model: 'CUAS-QH-1500',
    owner_unit: '前海安保联动中心',
    maintenance_unit: '反制设备前海组',
    lon: 113.8694,
    lat: 22.5148,
    alt: 24,
    status: 'online',
    health_score: 89,
    coverage_radius: 1500,
    min_alt: 0,
    max_alt: 350,
    capabilities: ['countermeasure'],
    metrics: { standby: true, power_percent: 79, authorized: true, response_level: 2 },
    next_maintenance_time: '2026-07-01T09:00:00.000Z'
  },
  {
    id: 'FAC-CUAS-QH-003',
    name: '前海合作区西侧反制点03',
    type: 'counter_uas',
    subtype: '移动反制终端',
    model: 'CUAS-QH-MOB-1000',
    owner_unit: '前海安保联动中心',
    maintenance_unit: '反制设备前海组',
    lon: 113.8582,
    lat: 22.5256,
    alt: 18,
    status: 'maintenance',
    health_score: 72,
    coverage_radius: 1000,
    min_alt: 0,
    max_alt: 250,
    capabilities: ['countermeasure'],
    metrics: { standby: false, power_percent: 61, authorized: true, response_level: 1 },
    next_maintenance_time: '2026-06-22T09:30:00.000Z'
  }
];

function ensureInfrastructureTables() {
  for (const sql of CREATE_SQL) run(sql);
}

function ensureInfrastructureData() {
  ensureInfrastructureTables();

  for (const id of LEGACY_AIRPORT_FACILITY_IDS) {
    if (getFacility(id)) deleteFacility(id);
  }

  for (const item of SAMPLE_FACILITIES) {
    const existing = getFacility(item.id);
    if (existing) {
      updateFacility(item.id, { ...item, coverage_radius: capCoverageRadius(item.coverage_radius) }, { recordStatus: false });
    } else {
      createFacility({ ...item, coverage_radius: capCoverageRadius(item.coverage_radius) });
    }
  }

  run('UPDATE infrastructure_facilities SET coverage_radius = ? WHERE coverage_radius > ?', [MAX_COVERAGE_RADIUS, MAX_COVERAGE_RADIUS]);

  ensureAlert({
    id: 'ALERT-RAD-006',
    facility_id: 'FAC-RAD-006',
    alert_type: 'performance',
    severity: 'high',
    title: '雷达航迹质量低于阈值',
    description: '蛇口相控阵雷达刷新率异常，重点空域监视覆盖能力下降。'
  });
  ensureAlert({
    id: 'ALERT-COM-004',
    facility_id: 'FAC-COM-004',
    alert_type: 'maintenance',
    severity: 'medium',
    title: '应急通信车进入维护窗口',
    description: '设备处于维护中，临时任务需确认备用通信覆盖。'
  });
  ensureMaintenanceOrder({
    id: 'MO-RAD-006',
    facility_id: 'FAC-RAD-006',
    alert_id: 'ALERT-RAD-006',
    order_type: 'repair',
    priority: 'high',
    status: 'processing',
    assignee: '雷达运维二组',
    description: '现场检查天线阵列与同步模块，恢复雷达航迹质量。'
  });
}

function capCoverageRadius(value) {
  return Math.min(Number(value || 1000), MAX_COVERAGE_RADIUS);
}

function ensureAlert(data) {
  const existing = queryOne('SELECT id FROM facility_alerts WHERE id = ?', [data.id]);
  if (!existing) createAlert(data);
}

function ensureMaintenanceOrder(data) {
  const existing = queryOne('SELECT id FROM maintenance_orders WHERE id = ?', [data.id]);
  if (!existing) createMaintenanceOrder(data);
}

function parseJson(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function jsonValue(value, fallback) {
  if (value == null) return fallback == null ? null : JSON.stringify(fallback);
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function normalizeFacility(row) {
  if (!row) return null;
  return {
    ...row,
    type_label: TYPE_LABELS[row.type] || row.type,
    status_label: STATUS_LABELS[row.status] || row.status,
    capabilities: parseJson(row.capabilities, []),
    metrics: parseJson(row.metrics, {}),
    coverage_geometry: parseJson(row.coverage_geometry, null)
  };
}

function normalizeAlert(row) {
  if (!row) return null;
  return {
    ...row,
    facility: row.facility_name ? {
      id: row.facility_id,
      name: row.facility_name,
      type: row.facility_type,
      status: row.facility_status
    } : null
  };
}

function normalizeOrder(row) {
  if (!row) return null;
  return {
    ...row,
    facility: row.facility_name ? {
      id: row.facility_id,
      name: row.facility_name,
      type: row.facility_type,
      status: row.facility_status
    } : null
  };
}

function listFacilities(filters = {}) {
  let sql = 'SELECT * FROM infrastructure_facilities WHERE 1=1';
  const params = [];
  if (filters.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.keyword) {
    sql += ' AND (name LIKE ? OR model LIKE ? OR owner_unit LIKE ?)';
    const keyword = `%${filters.keyword}%`;
    params.push(keyword, keyword, keyword);
  }
  sql += ' ORDER BY status = "fault" DESC, status = "offline" DESC, created_at DESC';
  return queryAll(sql, params).map(normalizeFacility);
}

function getFacility(id) {
  return normalizeFacility(queryOne('SELECT * FROM infrastructure_facilities WHERE id = ?', [id]));
}

function createFacility(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  run(
    `INSERT INTO infrastructure_facilities (
      id, name, type, subtype, model, owner_unit, maintenance_unit,
      lon, lat, alt, status, health_score, coverage_radius, min_alt, max_alt,
      coverage_shape, coverage_geometry, capabilities, metrics, last_seen_at,
      last_maintenance_time, next_maintenance_time
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      data.name,
      data.type,
      data.subtype || null,
      data.model || null,
      data.owner_unit || null,
      data.maintenance_unit || null,
      data.lon,
      data.lat,
      data.alt ?? 0,
      data.status || 'online',
      data.health_score ?? 100,
      capCoverageRadius(data.coverage_radius ?? 1000),
      data.min_alt ?? 0,
      data.max_alt ?? 300,
      data.coverage_shape || 'circle',
      jsonValue(data.coverage_geometry, null),
      jsonValue(data.capabilities, []),
      jsonValue(data.metrics, {}),
      data.last_seen_at || now,
      data.last_maintenance_time || null,
      data.next_maintenance_time || null
    ]
  );
  addStatusSnapshot(id, data.status || 'online', data.health_score ?? 100, data.metrics || {});
  return getFacility(id);
}

function updateFacility(id, data, options = {}) {
  const existing = getFacility(id);
  if (!existing) return null;
  const updated = {
    name: data.name ?? existing.name,
    type: data.type ?? existing.type,
    subtype: data.subtype ?? existing.subtype,
    model: data.model ?? existing.model,
    owner_unit: data.owner_unit ?? existing.owner_unit,
    maintenance_unit: data.maintenance_unit ?? existing.maintenance_unit,
    lon: data.lon ?? existing.lon,
    lat: data.lat ?? existing.lat,
    alt: data.alt ?? existing.alt,
    status: data.status ?? existing.status,
    health_score: data.health_score ?? existing.health_score,
    coverage_radius: capCoverageRadius(data.coverage_radius ?? existing.coverage_radius),
    min_alt: data.min_alt ?? existing.min_alt,
    max_alt: data.max_alt ?? existing.max_alt,
    coverage_shape: data.coverage_shape ?? existing.coverage_shape,
    coverage_geometry: data.coverage_geometry ?? existing.coverage_geometry,
    capabilities: data.capabilities ?? existing.capabilities,
    metrics: data.metrics ?? existing.metrics,
    last_seen_at: data.last_seen_at ?? existing.last_seen_at,
    last_maintenance_time: data.last_maintenance_time ?? existing.last_maintenance_time,
    next_maintenance_time: data.next_maintenance_time ?? existing.next_maintenance_time
  };
  run(
    `UPDATE infrastructure_facilities SET
      name=?, type=?, subtype=?, model=?, owner_unit=?, maintenance_unit=?, lon=?, lat=?, alt=?,
      status=?, health_score=?, coverage_radius=?, min_alt=?, max_alt=?, coverage_shape=?, coverage_geometry=?,
      capabilities=?, metrics=?, last_seen_at=?, last_maintenance_time=?, next_maintenance_time=?, updated_at=?
     WHERE id=?`,
    [
      updated.name, updated.type, updated.subtype, updated.model, updated.owner_unit, updated.maintenance_unit,
      updated.lon, updated.lat, updated.alt, updated.status, updated.health_score, updated.coverage_radius,
      updated.min_alt, updated.max_alt, updated.coverage_shape, jsonValue(updated.coverage_geometry, null),
      jsonValue(updated.capabilities, []), jsonValue(updated.metrics, {}), updated.last_seen_at,
      updated.last_maintenance_time, updated.next_maintenance_time, new Date().toISOString(), id
    ]
  );
  if (options.recordStatus !== false && (data.status || data.health_score || data.metrics)) {
    addStatusSnapshot(id, updated.status, updated.health_score, updated.metrics);
  }
  return getFacility(id);
}

function deleteFacility(id) {
  const existing = getFacility(id);
  if (!existing) return false;
  run('DELETE FROM facility_status_snapshots WHERE facility_id = ?', [id]);
  run('DELETE FROM maintenance_orders WHERE facility_id = ?', [id]);
  run('DELETE FROM facility_alerts WHERE facility_id = ?', [id]);
  run('DELETE FROM infrastructure_facilities WHERE id = ?', [id]);
  return true;
}

function addStatusSnapshot(facilityId, status, healthScore, metrics) {
  const id = uuidv4();
  run(
    `INSERT INTO facility_status_snapshots (id, facility_id, status, health_score, metrics, recorded_at)
     VALUES (?,?,?,?,?,?)`,
    [id, facilityId, status, healthScore, jsonValue(metrics, {}), new Date().toISOString()]
  );
  return id;
}

function updateFacilityStatus(id, data) {
  const existing = getFacility(id);
  if (!existing) return null;
  return updateFacility(id, {
    status: data.status ?? existing.status,
    health_score: data.health_score ?? existing.health_score,
    metrics: data.metrics ?? existing.metrics,
    last_seen_at: data.last_seen_at || new Date().toISOString()
  });
}

function listStatusSnapshots(facilityId, limit = 30) {
  return queryAll(
    'SELECT * FROM facility_status_snapshots WHERE facility_id = ? ORDER BY recorded_at DESC LIMIT ?',
    [facilityId, Number(limit) || 30]
  ).map(row => ({ ...row, metrics: parseJson(row.metrics, {}) }));
}

function listAlerts(filters = {}) {
  let sql = `SELECT a.*, f.name AS facility_name, f.type AS facility_type, f.status AS facility_status
    FROM facility_alerts a
    LEFT JOIN infrastructure_facilities f ON f.id = a.facility_id
    WHERE 1=1`;
  const params = [];
  if (filters.status) {
    sql += ' AND a.status = ?';
    params.push(filters.status);
  }
  if (filters.severity) {
    sql += ' AND a.severity = ?';
    params.push(filters.severity);
  }
  if (filters.facility_id) {
    sql += ' AND a.facility_id = ?';
    params.push(filters.facility_id);
  }
  sql += ' ORDER BY a.status = "new" DESC, a.occurred_at DESC';
  return queryAll(sql, params).map(normalizeAlert);
}

function createAlert(data) {
  const id = data.id || uuidv4();
  run(
    `INSERT INTO facility_alerts (id, facility_id, alert_type, severity, title, description, status, occurred_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      id,
      data.facility_id,
      data.alert_type || 'status',
      data.severity || 'medium',
      data.title,
      data.description || null,
      data.status || 'new',
      data.occurred_at || new Date().toISOString()
    ]
  );
  return queryOne('SELECT * FROM facility_alerts WHERE id = ?', [id]);
}

function updateAlert(id, data) {
  const existing = queryOne('SELECT * FROM facility_alerts WHERE id = ?', [id]);
  if (!existing) return null;
  const status = data.status ?? existing.status;
  const acknowledgedAt = data.acknowledged_at ?? existing.acknowledged_at ?? (status === 'acknowledged' ? new Date().toISOString() : null);
  const resolvedAt = data.resolved_at ?? existing.resolved_at ?? (status === 'resolved' || status === 'closed' ? new Date().toISOString() : null);
  run(
    `UPDATE facility_alerts SET alert_type=?, severity=?, title=?, description=?, status=?, acknowledged_at=?, resolved_at=? WHERE id=?`,
    [
      data.alert_type ?? existing.alert_type,
      data.severity ?? existing.severity,
      data.title ?? existing.title,
      data.description ?? existing.description,
      status,
      acknowledgedAt,
      resolvedAt,
      id
    ]
  );
  return queryOne('SELECT * FROM facility_alerts WHERE id = ?', [id]);
}

function listMaintenanceOrders(filters = {}) {
  let sql = `SELECT o.*, f.name AS facility_name, f.type AS facility_type, f.status AS facility_status
    FROM maintenance_orders o
    LEFT JOIN infrastructure_facilities f ON f.id = o.facility_id
    WHERE 1=1`;
  const params = [];
  if (filters.status) {
    sql += ' AND o.status = ?';
    params.push(filters.status);
  }
  if (filters.facility_id) {
    sql += ' AND o.facility_id = ?';
    params.push(filters.facility_id);
  }
  sql += ' ORDER BY o.status = "processing" DESC, o.created_at DESC';
  return queryAll(sql, params).map(normalizeOrder);
}

function createMaintenanceOrder(data) {
  const id = data.id || uuidv4();
  run(
    `INSERT INTO maintenance_orders (id, facility_id, alert_id, order_type, priority, status, assignee, description, result)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      id,
      data.facility_id,
      data.alert_id || null,
      data.order_type || 'inspection',
      data.priority || 'medium',
      data.status || 'pending',
      data.assignee || null,
      data.description || null,
      data.result || null
    ]
  );
  return queryOne('SELECT * FROM maintenance_orders WHERE id = ?', [id]);
}

function updateMaintenanceOrder(id, data) {
  const existing = queryOne('SELECT * FROM maintenance_orders WHERE id = ?', [id]);
  if (!existing) return null;
  const status = data.status ?? existing.status;
  const completedAt = data.completed_at ?? existing.completed_at ?? (status === 'completed' ? new Date().toISOString() : null);
  run(
    `UPDATE maintenance_orders SET order_type=?, priority=?, status=?, assignee=?, description=?, result=?, completed_at=? WHERE id=?`,
    [
      data.order_type ?? existing.order_type,
      data.priority ?? existing.priority,
      status,
      data.assignee ?? existing.assignee,
      data.description ?? existing.description,
      data.result ?? existing.result,
      completedAt,
      id
    ]
  );
  return queryOne('SELECT * FROM maintenance_orders WHERE id = ?', [id]);
}

function getSummary() {
  const facilities = listFacilities();
  const alerts = listAlerts();
  const orders = listMaintenanceOrders();
  const online = facilities.filter(f => f.status === 'online').length;
  const fault = facilities.filter(f => f.status === 'fault' || f.status === 'offline').length;
  const maintenance = facilities.filter(f => f.status === 'maintenance').length;
  const activeAlerts = alerts.filter(a => !['resolved', 'closed'].includes(a.status)).length;
  const pendingOrders = orders.filter(o => !['completed', 'closed'].includes(o.status)).length;
  const coverageScore = Math.round(
    facilities.reduce((sum, f) => sum + (f.status === 'online' ? Number(f.health_score || 0) : 0), 0) / Math.max(facilities.length, 1)
  );
  const byType = FACILITY_TYPES.map(type => ({
    type,
    label: TYPE_LABELS[type],
    count: facilities.filter(f => f.type === type).length,
    online: facilities.filter(f => f.type === type && f.status === 'online').length
  }));
  return {
    total: facilities.length,
    online,
    fault,
    maintenance,
    online_rate: facilities.length ? Math.round((online / facilities.length) * 100) : 0,
    coverage_score: coverageScore,
    active_alerts: activeAlerts,
    pending_orders: pendingOrders,
    by_type: byType
  };
}

function haversineMeters(a, b) {
  const radius = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

function routeCoordinates(route) {
  if (!route) return [];
  if (Array.isArray(route)) return route;
  if (route.type === 'LineString') return route.coordinates || [];
  if (route.coordinates) return route.coordinates;
  return [];
}

function evaluateCoverage(payload = {}) {
  const required = payload.required_capabilities && payload.required_capabilities.length
    ? payload.required_capabilities
    : ['communication', 'surveillance', 'identification'];
  const coords = routeCoordinates(payload.route);
  const facilities = listFacilities().filter(f => f.status === 'online');

  const points = coords.map((point, index) => {
    const lonLat = [point[0], point[1]];
    const alt = point[2] ?? 0;
    const capabilityResult = {};
    const matchedFacilities = [];
    for (const capability of required) {
      const matched = facilities.filter(f => {
        const coversCapability = Array.isArray(f.capabilities) && f.capabilities.includes(capability);
        const coversDistance = haversineMeters(lonLat, [f.lon, f.lat]) <= Number(f.coverage_radius || 0);
        const coversAlt = alt >= Number(f.min_alt ?? 0) && alt <= Number(f.max_alt ?? 10000);
        return coversCapability && coversDistance && coversAlt;
      });
      capabilityResult[capability] = matched.length ? 'good' : 'blind';
      matchedFacilities.push(...matched.map(f => f.id));
    }
    const blindCount = Object.values(capabilityResult).filter(v => v === 'blind').length;
    return {
      index,
      point,
      capabilities: capabilityResult,
      matched_facilities: [...new Set(matchedFacilities)],
      risk: blindCount === 0 ? 'low' : blindCount >= required.length ? 'high' : 'medium'
    };
  });

  const goodPoints = points.filter(p => Object.values(p.capabilities).every(v => v === 'good')).length;
  const overallScore = points.length ? Math.round((goodPoints / points.length) * 100) : 0;
  const blindZones = [];
  let current = null;
  points.forEach(point => {
    if (point.risk === 'low') {
      if (current) {
        current.end_index = point.index - 1;
        blindZones.push(current);
        current = null;
      }
      return;
    }
    if (!current) current = { start_index: point.index, end_index: point.index, risk: point.risk };
    current.end_index = point.index;
    if (point.risk === 'high') current.risk = 'high';
  });
  if (current) blindZones.push(current);

  return {
    overall_score: overallScore,
    sampled_points: points,
    blind_zones: blindZones,
    recommended_facilities: facilities
      .sort((a, b) => Number(b.health_score || 0) - Number(a.health_score || 0))
      .slice(0, 5)
      .map(f => ({ id: f.id, name: f.name, type: f.type, health_score: f.health_score }))
  };
}

module.exports = {
  ensureInfrastructureData,
  listFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
  updateFacilityStatus,
  listStatusSnapshots,
  listAlerts,
  createAlert,
  updateAlert,
  listMaintenanceOrders,
  createMaintenanceOrder,
  updateMaintenanceOrder,
  getSummary,
  evaluateCoverage
};
