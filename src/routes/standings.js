const express = require('express');
const router = express.Router();
const standingsService = require('../services/standingsService');
const { requireTeamOrAdmin } = require('../middleware/auth');

router.get('/', requireTeamOrAdmin, (req, res) => {
  const showBudget = res.locals.isAdmin || res.locals.phase === 'confirm_closed';
  const standings = showBudget
    ? standingsService.getStandingsWithBudget()
    : standingsService.getStandings();

  res.render('standings/standings', { title: 'Classifica', standings, showBudget });
});

module.exports = router;
