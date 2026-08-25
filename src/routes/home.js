const express = require('express');
const router = express.Router();
const voteService = require('../services/voteService');
const confirmService = require('../services/confirmService');

function buildStatusMessage({ isAdmin, phase, myVoteStatus, myConfirmed, teamsFullyVoted, totalTeams, confirmProgress }) {
  if (isAdmin) {
    switch (phase) {
      case 'voting_open':
        return {
          text: `Fase di voto in corso: ${teamsFullyVoted}/${totalTeams} squadre hanno finito di votare.`,
          href: '/admin',
          label: 'Vai alla dashboard',
        };
      case 'voting_closed':
        return {
          text: 'Voto chiuso. Puoi aprire le riconferme quando vuoi dalla dashboard.',
          href: '/admin',
          label: 'Vai alla dashboard',
        };
      case 'confirm_open':
        return {
          text: `Riconferme in corso: ${confirmProgress.doneCount}/${confirmProgress.totalTeams} squadre hanno confermato.`,
          href: '/admin',
          label: 'Vai alla dashboard',
        };
      default:
        return {
          text: 'Stagione pronta: voto e riconferme chiuse per tutti.',
          href: '/classifica',
          label: 'Vedi la classifica e i crediti asta',
        };
    }
  }

  switch (phase) {
    case 'voting_open': {
      if (myVoteStatus && myVoteStatus.doneCount < myVoteStatus.totalTargets) {
        const mancanti = myVoteStatus.totalTargets - myVoteStatus.doneCount;
        return {
          text: `Ti mancano ancora ${mancanti} squadre da votare.`,
          href: '/voting',
          label: 'Vota adesso',
        };
      }
      return {
        text: `Hai votato tutte le rose. In attesa che finisca anche la lega (${teamsFullyVoted}/${totalTeams}).`,
        href: '/voting',
        label: "Vedi l'avanzamento",
      };
    }
    case 'voting_closed':
      return {
        text: 'Il voto è chiuso: ora puoi vedere chi ha votato chi. Le riconferme apriranno a breve.',
        href: '/tally',
        label: 'Vedi i voti ricevuti',
      };
    case 'confirm_open':
      if (!myConfirmed) {
        return {
          text: 'È il momento di confermare la tua rosa.',
          href: '/confirm',
          label: 'Conferma ora',
        };
      }
      return {
        text: `Hai confermato la tua rosa. In attesa delle altre squadre (${confirmProgress.doneCount}/${confirmProgress.totalTeams}).`,
        href: '/confirm',
        label: 'Vedi la tua riconferma',
      };
    default:
      return {
        text: 'Tutto concluso: guarda la classifica finale e i crediti per l\'asta.',
        href: '/classifica',
        label: 'Vai alla classifica',
      };
  }
}

router.get('/', (req, res) => {
  if (!req.session.teamId && !req.session.isAdmin) {
    return res.redirect('/login');
  }

  const voteProgress = voteService.getProgress();
  const teamsFullyVoted = voteProgress.filter((p) => p.doneCount === p.totalTargets).length;
  const totalTeams = voteProgress.length;
  const confirmProgress = confirmService.getProgress();

  let myVoteStatus = null;
  let myConfirmed = null;
  if (res.locals.team) {
    myVoteStatus = voteProgress.find((p) => p.teamId === res.locals.team.id) || null;
    myConfirmed = confirmService.getConfirmationsForTeam(res.locals.team.id).length > 0;
  }

  const status = buildStatusMessage({
    isAdmin: res.locals.isAdmin,
    phase: res.locals.phase,
    myVoteStatus,
    myConfirmed,
    teamsFullyVoted,
    totalTeams,
    confirmProgress,
  });

  res.render('home/home', {
    title: 'Home',
    status,
    teamsFullyVoted,
    totalTeams,
    confirmProgress,
  });
});

module.exports = router;
