const db = require('../db');

function getSelectedIdsForPair(voterTeamId, targetTeamId) {
  const rows = db
    .prepare(
      `SELECT votes.player_id AS id
       FROM votes
       JOIN players ON players.id = votes.player_id
       WHERE votes.voter_team_id = ? AND players.team_id = ?`
    )
    .all(voterTeamId, targetTeamId);
  return rows.map((r) => r.id);
}

// Replaces the voter's selection for a single target roster in one
// transaction, and records that a submission happened (even if the
// resulting selection is empty) so the progress view can tell "not voted
// yet" apart from "voted for zero players on purpose".
const replaceVotesForTarget = db.transaction((voterTeamId, targetTeamId, playerIds) => {
  db.prepare(
    `DELETE FROM votes
     WHERE voter_team_id = ?
       AND player_id IN (SELECT id FROM players WHERE team_id = ?)`
  ).run(voterTeamId, targetTeamId);

  const insert = db.prepare('INSERT INTO votes (voter_team_id, player_id) VALUES (?, ?)');
  for (const playerId of playerIds) {
    insert.run(voterTeamId, playerId);
  }

  db.prepare(
    `INSERT INTO vote_submissions (voter_team_id, target_team_id, submitted_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT (voter_team_id, target_team_id)
     DO UPDATE SET submitted_at = datetime('now')`
  ).run(voterTeamId, targetTeamId);
});

// Map of playerId -> { count, voterNames: string[] }, used by the public
// tally page (votes are not blind, unlike confirmations).
function getVoteTally() {
  const rows = db
    .prepare(
      `SELECT votes.player_id AS playerId, teams.name AS voterName
       FROM votes
       JOIN teams ON teams.id = votes.voter_team_id
       ORDER BY teams.name`
    )
    .all();

  const tally = new Map();
  for (const row of rows) {
    if (!tally.has(row.playerId)) {
      tally.set(row.playerId, { count: 0, voterNames: [] });
    }
    const entry = tally.get(row.playerId);
    entry.count += 1;
    entry.voterNames.push(row.voterName);
  }
  return tally;
}

function getVoteCount(playerId) {
  const row = db.prepare('SELECT COUNT(*) AS count FROM votes WHERE player_id = ?').get(playerId);
  return row.count;
}

// For every team, how many of the 9 other rosters it has already
// submitted a vote for, and which ones are still missing.
function getProgress() {
  const teams = db.prepare('SELECT id, name FROM teams ORDER BY name').all();
  const submissions = db
    .prepare('SELECT voter_team_id, target_team_id FROM vote_submissions')
    .all();

  const doneMap = new Map(); // voterTeamId -> Set(targetTeamId)
  for (const s of submissions) {
    if (!doneMap.has(s.voter_team_id)) doneMap.set(s.voter_team_id, new Set());
    doneMap.get(s.voter_team_id).add(s.target_team_id);
  }

  return teams.map((voter) => {
    const targets = teams.filter((t) => t.id !== voter.id);
    const done = doneMap.get(voter.id) || new Set();
    const missing = targets.filter((t) => !done.has(t.id)).map((t) => t.name);
    return {
      teamId: voter.id,
      teamName: voter.name,
      doneCount: targets.length - missing.length,
      totalTargets: targets.length,
      missing,
    };
  });
}

module.exports = {
  getSelectedIdsForPair,
  replaceVotesForTarget,
  getVoteTally,
  getVoteCount,
  getProgress,
};
