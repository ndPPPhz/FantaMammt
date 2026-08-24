const db = require('../db');
const { hashPin, verifyPin } = require('../lib/pin');

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

function checkPin(team, plainPin) {
  return verifyPin(plainPin, team.pin_hash);
}

// Admin-triggered reset: generates a new random PIN, stores its hash, and
// returns the plaintext once so the admin can share it with the team.
function resetPin(teamId) {
  const pin = generatePin();
  db.prepare('UPDATE teams SET pin_hash = ? WHERE id = ?').run(hashPin(pin), teamId);
  return pin;
}

// Self-service: a logged-in team picks its own PIN. Not visible to
// anyone (including the admin) after this, only its hash is stored.
function setPin(teamId, plainPin) {
  db.prepare('UPDATE teams SET pin_hash = ? WHERE id = ?').run(hashPin(plainPin), teamId);
}

module.exports = { getAll, getById, findByName, generatePin, checkPin, resetPin, setPin };
