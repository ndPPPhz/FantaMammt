const fs = require('fs');
const path = require('path');
const db = require('../src/db');
const teamService = require('../src/services/teamService');

function loadSeedData() {
  const filePath = path.join(__dirname, '..', 'data', 'rose_seed.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const seed = db.transaction((teamsData) => {
  db.prepare('DELETE FROM confirmations').run();
  db.prepare('DELETE FROM votes').run();
  db.prepare('DELETE FROM vote_submissions').run();
  db.prepare('DELETE FROM players').run();
  db.prepare('DELETE FROM teams').run();
  db.prepare('DELETE FROM settings').run();

  const insertTeam = db.prepare(
    'INSERT INTO teams (name, pin, credits_residui) VALUES (?, ?, ?)'
  );
  const insertPlayer = db.prepare(
    'INSERT INTO players (team_id, ruolo, nome, squadra, costo_precedente) VALUES (?, ?, ?, ?, ?)'
  );

  const summary = [];

  for (const team of teamsData) {
    const pin = teamService.generatePin();
    const info = insertTeam.run(team.name, pin, team.credits_residui || 0);
    const teamId = info.lastInsertRowid;
    summary.push({ name: team.name, pin });

    for (const player of team.players) {
      insertPlayer.run(teamId, player.role, player.name, player.club, player.cost || 0);
    }
  }

  db.prepare("INSERT INTO settings (id, phase) VALUES (1, 'voting_open')").run();

  return summary;
});

const teamsData = loadSeedData();
const summary = seed(teamsData);

console.log(`\nSeed completato: ${teamsData.length} squadre, fase iniziale "voting_open".\n`);
console.table(summary);
console.log('\nCondividi il PIN con il relativo allenatore (visibile anche da /admin/teams).\n');
