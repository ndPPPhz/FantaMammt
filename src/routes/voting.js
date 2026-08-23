const express = require('express');
const router = express.Router();
const teamService = require('../services/teamService');
const playerService = require('../services/playerService');
const voteService = require('../services/voteService');
const { validateSelection } = require('../lib/validation');
const { requireTeam, setFlash } = require('../middleware/auth');

router.use(requireTeam);

router.get('/', (req, res) => {
  const otherTeams = teamService.getAll().filter((t) => t.id !== req.team.id);

  const myProgress = otherTeams.map((team) => ({
    team,
    selectedCount: voteService.getSelectedIdsForPair(req.team.id, team.id).length,
  }));

  const overallProgress = voteService.getProgress();

  res.render('voting/teamList', { title: 'Vota', myProgress, overallProgress });
});

router.get('/:teamId', (req, res) => {
  const targetId = Number(req.params.teamId);
  const targetTeam = teamService.getById(targetId);

  if (!targetTeam || targetId === req.team.id) {
    setFlash(req, 'error', 'Squadra non valida.');
    return res.redirect('/voting');
  }

  const players = playerService.getByTeam(targetId);
  const selectedIds = new Set(voteService.getSelectedIdsForPair(req.team.id, targetId));

  res.render('voting/voteTeam', {
    title: `Vota ${targetTeam.name}`,
    targetTeam,
    players,
    selectedIds,
  });
});

router.post('/:teamId', (req, res) => {
  const targetId = Number(req.params.teamId);
  const targetTeam = teamService.getById(targetId);

  if (!targetTeam || targetId === req.team.id) {
    setFlash(req, 'error', 'Squadra non valida.');
    return res.redirect('/voting');
  }

  if (res.locals.phase !== 'voting_open') {
    setFlash(req, 'error', 'La fase di voto è chiusa: non puoi più modificare i voti.');
    return res.redirect('/voting');
  }

  const players = playerService.getByTeam(targetId);
  const rawIds = [].concat(req.body.playerIds || []);
  const result = validateSelection(rawIds, players);

  if (!result.ok) {
    setFlash(req, 'error', result.error);
    return res.redirect(`/voting/${targetId}`);
  }

  voteService.replaceVotesForTarget(req.team.id, targetId, result.ids);
  setFlash(req, 'success', `Voti per ${targetTeam.name} salvati (${result.ids.length}/5).`);
  res.redirect('/voting');
});

module.exports = router;
