const initSQL = require('./db');
const fs = require('fs');
const path = require('path');

let db = null;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'lis2.db');

async function getDb() {
  if (db) return db;

  const init = require('sql.js');
  const SQL = await init();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    db.run(initSQL);
    saveDb();
  }

  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, buffer);
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return {
    changes: db.getRowsModified(),
    lastInsertRowid: getLastInsertRowId()
  };
}

function getLastInsertRowId() {
  const result = queryAll('SELECT last_insert_rowid() as id');
  return result.length > 0 ? result[0].id : null;
}

module.exports = { getDb, queryAll, queryOne, run, saveDb };
