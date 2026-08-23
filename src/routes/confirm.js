const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');
const voteService = require('../services/voteService');
const confirmService = require('../services/confirmService');
const { computeConfirmCost } = require('../lib/confirmCost');
const { validateSelection } = require('../lib/validation');
const { requireTeam, setFlash } = require('../middleware/auth');

router.use(requireTeam);

router.get('/', (req, res) => {
  const phase = res.locals.phase;

  if (phase === 'voting_open' || phase === 'voting_closed') {
    return res.render('confirm/confirm', {
      title: 'Riconferme',
      waiting: true,
      readOnly: false,
    });
  }

  const players = playerService.getByTeam(req.team.id).map((player) => {
    const numVoti = voteService.getVoteCount(player.id);
    return {
      ...player,
      numVoti,
      costoConferma: computeConfirmCost(player.costo_precedente, numVoti),
    };
  });

  if (phase === 'confirm_closed') {
    const confirmed = confirmService.getConfirmationsForTeam(req.team.id);
    const confirmedIds = new Set(confirmed.map((c) => c.player_id));
    const totalCost = confirmed.reduce((sum, c) => sum + c.costo_conferma, 0);
    return res.render('confirm/confirm', {
      title: 'Riconferme',
      waiting: false,
      readOnly: true,
      players,
      selectedIds: confirmedIds,
      totalCost,
    });
  }

  // confirm_open
  const confirmed = confirmService.getConfirmationsForTeam(req.team.id);
  const selectedIds = new Set(confirmed.map((c) => c.player_id));
  res.render('confirm/confirm', {
    title: 'Riconferme',
    waiting: false,
    readOnly: false,
    players,
    selectedIds,
  });
});

router.post('/', (req, res) => {
  if (res.locals.phase !== 'confirm_open') {
    setFlash(req, 'error', 'La fase di riconferma non è aperta.');
    return res.redirect('/confirm');
  }

  const players = playerService.getByTeam(req.team.id);
  const rawIds = [].concat(req.body.playerIds || []);
  const result = validateSelection(rawIds, players);

  if (!result.ok) {
    setFlash(req, 'error', result.error);
    return res.redirect('/confirm');
  }

  confirmService.replaceConfirmations(req.team.id, result.ids);
  setFlash(req, 'success', `Riconferme salvate (${result.ids.length}/5).`);
  res.redirect('/confirm');
});

module.exports = router;
