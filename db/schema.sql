CREATE TABLE IF NOT EXISTS teams (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT NOT NULL UNIQUE,
  pin_hash          TEXT NOT NULL,
  credits_residui   INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS players (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id             INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  ruolo               TEXT NOT NULL CHECK (ruolo IN ('P','D','C','A')),
  nome                TEXT NOT NULL,
  squadra             TEXT NOT NULL,
  costo_precedente    INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_ruolo ON players(ruolo);

CREATE TABLE IF NOT EXISTS votes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  voter_team_id     INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id         INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (voter_team_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_votes_player ON votes(player_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_team_id);

-- Traccia che una squadra ha inviato (almeno una volta) la propria
-- selezione di voto per una rosa bersaglio, anche se ha scelto 0
-- giocatori. Serve a distinguere "non ancora votato" da "votato 0
-- giocatori di proposito" nella vista di avanzamento generale.
CREATE TABLE IF NOT EXISTS vote_submissions (
  voter_team_id     INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  target_team_id    INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  submitted_at      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (voter_team_id, target_team_id)
);

CREATE TABLE IF NOT EXISTS confirmations (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id           INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id         INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  costo_conferma    INTEGER NOT NULL,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (team_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_confirmations_team ON confirmations(team_id);

CREATE TABLE IF NOT EXISTS settings (
  id                INTEGER PRIMARY KEY CHECK (id = 1),
  phase             TEXT NOT NULL DEFAULT 'voting_open'
                       CHECK (phase IN ('voting_open','voting_closed','confirm_open','confirm_closed')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
