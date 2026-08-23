const db = require('../db');

function getAll() {
  return db.prepare('SELECT * FROM teams ORDER BY name').all();
}

function getById(id) {
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
}

function findByName(name) {
  return db.prepare('SELECT * FROM teams WHERE name = ?').get(name);
}

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function resetPin(teamId) {
  const pin = generatePin();
  db.prepare('UPDATE teams SET pin = ? WHERE id = ?').run(pin, teamId);
  return pin;
}

module.exports = { getAll, getById, findByName, generatePin, resetPin };
