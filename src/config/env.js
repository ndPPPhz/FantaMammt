const path = require('path');
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  dbPath: process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : path.resolve(process.cwd(), 'db/fantamammt.sqlite'),
};

module.exports = config;
