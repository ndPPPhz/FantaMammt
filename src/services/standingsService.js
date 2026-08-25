const db = require('../db');
const standingsData = require('../../data/standings_seed.json');
const { computeStandings } = require('../lib/standings');

function getStandings() {
  return computeStandings(standingsData);
}

// Adds costoRiconferme and creditiResiduiAsta per team, based on the
// confirmations already recorded - no schema change needed.
function getStandingsWithBudget() {
  const standings = getStandings();

  const teams = db.prepare('SELECT id, name FROM teams').all();
  const teamIdByName = new Map(teams.map((t) => [t.name, t.id]));

  const totals = db
    .prepare('SELECT team_id, SUM(costo_conferma) AS total FROM confirmations GROUP BY team_id')
    .all();
  const totalByTeamId = new Map(totals.map((r) => [r.team_id, r.total]));

  return standings.map((s) => {
    const teamId = teamIdByName.get(s.name);
    const costoRiconferme = totalByTeamId.get(teamId) || 0;
    return {
      ...s,
      costoRiconferme,
      creditiResiduiAsta: s.creditiInizioStagione - costoRiconferme,
    };
  });
}

module.exports = { getStandings, getStandingsWithBudget };
