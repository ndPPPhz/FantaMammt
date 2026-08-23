const db = require('../db');

const PHASES = ['voting_open', 'voting_closed', 'confirm_open', 'confirm_closed'];

function ensureRow() {
  const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  if (!existing) {
    db.prepare('INSERT INTO settings (id, phase) VALUES (1, ?)').run(PHASES[0]);
  }
}

function getPhase() {
  ensureRow();
  return db.prepare('SELECT phase FROM settings WHERE id = 1').get().phase;
}

// Only forward transitions are allowed from the admin UI, to avoid
// accidentally un-revealing tallies or reopening confirm after cost
// snapshots were already taken.
function setPhase(nextPhase) {
  const current = getPhase();
  const currentIdx = PHASES.indexOf(current);
  const nextIdx = PHASES.indexOf(nextPhase);

  if (nextIdx === -1) {
    return { ok: false, error: 'Fase non valida.' };
  }
  if (nextIdx !== currentIdx + 1) {
    return { ok: false, error: `Non puoi passare da "${current}" a "${nextPhase}".` };
  }

  db.prepare("UPDATE settings SET phase = ?, updated_at = datetime('now') WHERE id = 1").run(
    nextPhase
  );
  return { ok: true, phase: nextPhase };
}

module.exports = { getPhase, setPhase, PHASES };
