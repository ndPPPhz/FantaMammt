const db = require('../db');

const ROLE_ORDER = { P: 0, D: 1, C: 2, A: 3 };

function sortByRole(players) {
  return [...players].sort((a, b) => {
    const roleDiff = ROLE_ORDER[a.ruolo] - ROLE_ORDER[b.ruolo];
    if (roleDiff !== 0) return roleDiff;
    return a.nome.localeCompare(b.nome);
  });
}

function getByTeam(teamId) {
  const rows = db.prepare('SELECT * FROM players WHERE team_id = ?').all(teamId);
  return sortByRole(rows);
}

function getById(id) {
  return db.prepare('SELECT * FROM players WHERE id = ?').get(id);
}

function getAllWithTeam() {
  const rows = db
    .prepare(
      `SELECT players.*, teams.name AS team_name
       FROM players
       JOIN teams ON teams.id = players.team_id`
    )
    .all();
  return sortByRole(rows);
}

module.exports = { getByTeam, getById, getAllWithTeam, sortByRole, ROLE_ORDER };
