const teamService = require('../services/teamService');
const settingsService = require('../services/settingsService');

function attachPhase(req, res, next) {
  res.locals.phase = settingsService.getPhase();
  res.locals.team = req.session.teamId ? teamService.getById(req.session.teamId) : null;
  res.locals.isAdmin = !!req.session.isAdmin;
  next();
}

function attachFlash(req, res, next) {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function requireTeam(req, res, next) {
  if (!req.session.teamId) return res.redirect('/login');
  const team = teamService.getById(req.session.teamId);
  if (!team) {
    return req.session.destroy(() => res.redirect('/login'));
  }
  req.team = team;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  next();
}

function requireTeamOrAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  return requireTeam(req, res, next);
}

module.exports = {
  attachPhase,
  attachFlash,
  setFlash,
  requireTeam,
  requireAdmin,
  requireTeamOrAdmin,
};
