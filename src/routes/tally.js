const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');
const voteService = require('../services/voteService');
const { requireTeamOrAdmin } = require('../middleware/auth');

router.get('/', requireTeamOrAdmin, (req, res) => {
  if (!res.locals.isAdmin && res.locals.phase !== 'confirm_closed') {
    return res.render('tally/tally', { title: 'Voti ricevuti', waiting: true });
  }

  const players = playerService.getAllWithTeam();
  const tally = voteService.getVoteTally();

  const rows = players.map((player) => {
    const entry = tally.get(player.id) || { count: 0, voterNames: [] };
    return { player, count: entry.count, voterNames: entry.voterNames };
  });

  rows.sort((a, b) => b.count - a.count);

  res.render('tally/tally', { title: 'Voti ricevuti', waiting: false, rows });
});

module.exports = router;
