const initSQL = `
CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flight_plans (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  plan_name TEXT,
  start_time TEXT NOT NULL,
  start_lon REAL NOT NULL,
  start_lat REAL NOT NULL,
  start_alt REAL NOT NULL,
  end_time TEXT,
  end_lon REAL,
  end_lat REAL,
  end_alt REAL,
  aircraft_type TEXT,
  waypoints TEXT,
  time_flexible INTEGER DEFAULT 1,
  alt_flexible INTEGER DEFAULT 1,
  interruptible INTEGER DEFAULT 1,
  unstructured_notes TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (operator_id) REFERENCES operators(id)
);

CREATE TABLE IF NOT EXISTS no_fly_zones (
  id TEXT PRIMARY KEY,
  name TEXT,
  geometry TEXT NOT NULL,
  min_alt REAL,
  max_alt REAL,
  start_time TEXT,
  end_time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  involved_plans TEXT NOT NULL,
  time_window_start TEXT NOT NULL,
  time_window_end TEXT NOT NULL,
  conflict_point_lon REAL,
  conflict_point_lat REAL,
  conflict_alt REAL,
  distance REAL,
  status TEXT DEFAULT 'unresolved',
  parent_event_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conflict_details (
  id TEXT PRIMARY KEY,
  conflict_event_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  involved_segment_start_time TEXT,
  involved_segment_end_time TEXT,
  FOREIGN KEY (conflict_event_id) REFERENCES conflict_events(id),
  FOREIGN KEY (plan_id) REFERENCES flight_plans(id)
);

CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  conflict_event_id TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conflict_event_id) REFERENCES conflict_events(id)
);

CREATE TABLE IF NOT EXISTS session_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES agent_sessions(id)
);
`;

module.exports = initSQL;
