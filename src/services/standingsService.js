const db = require('../db');
const standingsData = require('../../data/standings_seed.json');
const { computeStandings } = require('../lib/standings');

function getStandings() {
  const standings = computeStandings(standingsData);

  const teams = db.prepare('SELECT name, credits_residui FROM teams').all();
  const creditsResiduiByName = new Map(teams.map((t) => [t.name, t.credits_residui]));

  return standings.map((s) => {
    const creditiResiduiAnnoScorso = creditsResiduiByName.get(s.name) ?? 0;
    return {
      ...s,
      creditiResiduiAnnoScorso,
      // "Crediti inizio stagione" dal regolamento è "no rimanenze": vanno
      // sommati a parte i crediti residui dell'anno scorso per ottenere
      // il budget totale disponibile per l'asta.
      budgetTotaleAsta: s.creditiInizioStagione + creditiResiduiAnnoScorso,
    };
  });
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
      creditiResiduiAsta: s.budgetTotaleAsta - costoRiconferme,
    };
  });
}

module.exports = { getStandings, getStandingsWithBudget };
