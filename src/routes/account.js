const express = require('express');
const router = express.Router();
const teamService = require('../services/teamService');
const { requireTeam, setFlash } = require('../middleware/auth');

router.use(requireTeam);

router.get('/', (req, res) => {
  res.render('account/changePin', { title: 'Cambia PIN' });
});

router.post('/', (req, res) => {
  const { currentPin, newPin, confirmPin } = req.body;

  if (!teamService.checkPin(req.team, String(currentPin || '').trim())) {
    setFlash(req, 'error', 'PIN attuale non corretto.');
    return res.redirect('/account');
  }

  const cleanNewPin = String(newPin || '').trim();
  if (!/^\d{4}$/.test(cleanNewPin)) {
    setFlash(req, 'error', 'Il nuovo PIN deve essere di 4 cifre.');
    return res.redirect('/account');
  }

  if (cleanNewPin !== String(confirmPin || '').trim()) {
    setFlash(req, 'error', 'I due PIN inseriti non coincidono.');
    return res.redirect('/account');
  }

  teamService.setPin(req.team.id, cleanNewPin);
  setFlash(req, 'success', 'PIN aggiornato. Da ora in poi lo conosci solo tu.');
  res.redirect('/account');
});

module.exports = router;
