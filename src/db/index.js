const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config/env');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
