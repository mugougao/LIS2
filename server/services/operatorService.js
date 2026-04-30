const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');

function listOperators() {
  return queryAll('SELECT * FROM operators ORDER BY created_at DESC');
}

function getOperator(id) {
  return queryOne('SELECT * FROM operators WHERE id = ?', [id]);
}

function createOperator(data) {
  const id = data.id || uuidv4();
  const { name, contact } = data;
  run('INSERT INTO operators (id, name, contact) VALUES (?,?,?)', [id, name, contact || null]);
  return getOperator(id);
}

function ensureOperatorsExist() {
  const existing = listOperators();
  if (existing.length === 0) {
    createOperator({ id: 'op-a', name: '运营商A', contact: 'contact-a@example.com' });
    createOperator({ id: 'op-b', name: '运营商B', contact: 'contact-b@example.com' });
    createOperator({ id: 'op-c', name: '运营商C', contact: 'contact-c@example.com' });
  }
}

module.exports = { listOperators, getOperator, createOperator, ensureOperatorsExist };
