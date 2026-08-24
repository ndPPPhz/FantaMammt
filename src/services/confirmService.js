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

// Uses "has at least one confirmation row" as the signal for "has
// submitted", same as /admin/results already does implicitly - no extra
// table needed (unlike voting, a team confirming zero players on purpose
// isn't a realistic case worth distinguishing).
function getProgress() {
  const teams = db.prepare('SELECT id, name FROM teams ORDER BY name').all();
  const confirmedTeamIds = new Set(
    db.prepare('SELECT DISTINCT team_id FROM confirmations').all().map((r) => r.team_id)
  );
  const missing = teams.filter((t) => !confirmedTeamIds.has(t.id)).map((t) => t.name);
  return {
    doneCount: teams.length - missing.length,
    totalTeams: teams.length,
    missing,
  };
}

function getAllResults() {
  const teams = db.prepare('SELECT * FROM teams ORDER BY name').all();
  return teams.map((team) => {
    const players = getConfirmationsForTeam(team.id);
    const totalCost = players.reduce((sum, p) => sum + p.costo_conferma, 0);
    return { team, players, totalCost };
  });
}

module.exports = { getConfirmationsForTeam, replaceConfirmations, getAllResults, getProgress };
