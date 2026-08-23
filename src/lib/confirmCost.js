// Tabella N autoritativa dal regolamento (voti -> N), valida per 0-9 voti
// (una squadra non può mai votare per un proprio giocatore, quindi il
// massimo teorico di voti per un giocatore è 9, cioè tutte le altre squadre).
const VOTE_TO_N = {
  0: 1,
  1: 2,
  2: 2,
  3: 3,
  4: 5,
  5: 8,
  6: 11,
  7: 17,
  8: 26,
  9: 38,
};

const MAX_VOTES = 9;

function nForVotes(numVoti) {
  const capped = Math.max(0, Math.min(MAX_VOTES, Math.trunc(numVoti)));
  return VOTE_TO_N[capped];
}

// CostoConferma = round(CostoAnnoPrecedente * 1.25 + N)
function computeConfirmCost(costoAnnoPrecedente, numVoti) {
  const n = nForVotes(numVoti);
  return Math.round(costoAnnoPrecedente * 1.25 + n);
}

module.exports = { VOTE_TO_N, MAX_VOTES, nForVotes, computeConfirmCost };
