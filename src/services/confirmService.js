const db = require('../db');
const { computeConfirmCost } = require('../lib/confirmCost');
const { getVoteCount } = require('./voteService');

function getConfirmationsForTeam(teamId) {
  return db
    .prepare(
      `SELECT confirmations.*, players.nome, players.ruolo, players.squadra
       FROM confirmations
       JOIN players ON players.id = confirmations.player_id
       WHERE confirmations.team_id = ?`
    )
    .all(teamId);
}

// Replaces the team's confirmations with the submitted set, computing and
// snapshotting the confirm cost for each player at this moment (votes are
// already frozen by the time the confirm phase opens).
const replaceConfirmations = db.transaction((teamId, playerIds) => {
  db.prepare('DELETE FROM confirmations WHERE team_id = ?').run(teamId);

  const getPlayer = db.prepare('SELECT * FROM players WHERE id = ?');
  const insert = db.prepare(
    'INSERT INTO confirmations (team_id, player_id, costo_conferma) VALUES (?, ?, ?)'
  );

  for (const playerId of playerIds) {
    const player = getPlayer.get(playerId);
    const numVoti = getVoteCount(playerId);
    const cost = computeConfirmCost(player.costo_precedente, numVoti);
    insert.run(teamId, playerId, cost);
  }
});

function getAllResults() {
  const teams = db.prepare('SELECT * FROM teams ORDER BY name').all();
  return teams.map((team) => {
    const players = getConfirmationsForTeam(team.id);
    const totalCost = players.reduce((sum, p) => sum + p.costo_conferma, 0);
    return { team, players, totalCost };
  });
}

module.exports = { getConfirmationsForTeam, replaceConfirmations, getAllResults };
