const express = require('express');
const router = express.Router();
const teamService = require('../services/teamService');
const voteService = require('../services/voteService');
const confirmService = require('../services/confirmService');
const settingsService = require('../services/settingsService');
const { requireAdmin, setFlash } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard admin',
    phase: res.locals.phase,
    phases: settingsService.PHASES,
    confirmProgress: confirmService.getProgress(),
  });
});

router.post('/phase', (req, res) => {
  const result = settingsService.setPhase(req.body.phase);
  if (!result.ok) {
    setFlash(req, 'error', result.error);
  } else {
    setFlash(req, 'success', `Fase aggiornata a "${result.phase}".`);
  }
  res.redirect('/admin');
});

router.get('/teams', (req, res) => {
  res.render('admin/teams', { title: 'Squadre', teams: teamService.getAll() });
});

router.post('/teams/:teamId/reset-pin', (req, res) => {
  const team = teamService.getById(Number(req.params.teamId));
  if (!team) {
    setFlash(req, 'error', 'Squadra non trovata.');
    return res.redirect('/admin/teams');
  }
  const pin = teamService.resetPin(team.id);
  setFlash(req, 'success', `Nuovo PIN per ${team.name}: ${pin}`);
  res.redirect('/admin/teams');
});

router.get('/overview', (req, res) => {
  const teams = teamService.getAll();
  const matrix = teams.map((voter) => ({
    voter,
    cells: teams.map((target) => {
      if (target.id === voter.id) return null;
      return voteService.getSelectedIdsForPair(voter.id, target.id).length;
    }),
  }));
  res.render('admin/overview', { title: 'Panoramica voti', teams, matrix });
});

router.get('/results', (req, res) => {
  const results = confirmService.getAllResults();
  res.render('admin/results', { title: 'Risultati riconferme', results });
});

module.exports = router;
