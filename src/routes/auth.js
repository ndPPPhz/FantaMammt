const express = require('express');
const router = express.Router();
const teamService = require('../services/teamService');
const config = require('../config/env');
const { setFlash } = require('../middleware/auth');

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Accedi', teams: teamService.getAll() });
});

router.post('/login', (req, res) => {
  const { name, pin } = req.body;
  const team = teamService.findByName(name || '');

  if (!team || !teamService.checkPin(team, String(pin || '').trim())) {
    setFlash(req, 'error', 'Squadra o PIN non corretti.');
    return res.redirect('/login');
  }

  req.session.teamId = team.id;
  delete req.session.isAdmin;
  res.redirect('/voting');
});

router.get('/admin/login', (req, res) => {
  res.render('auth/adminLogin', { title: 'Accesso admin' });
});

router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== config.adminPassword) {
    setFlash(req, 'error', 'Password non corretta.');
    return res.redirect('/admin/login');
  }

  req.session.isAdmin = true;
  delete req.session.teamId;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
