// Crediti inizio stagione per posizione finale in classifica, dal
// regolamento (sistema di ribilanciamento crediti in base alla classifica).
const CREDITI_INIZIO_STAGIONE = {
  1: 480,
  2: 490,
  3: 495,
  4: 498,
  5: 500,
  6: 500,
  7: 502,
  8: 505,
  9: 510,
  10: 520,
};

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Ranking sportivo standard (1,2,2,4,4,4,7,...): due squadre a pari
// merito condividono la stessa posizione, la successiva posizione
// distinta salta in avanti del numero di squadre a pari merito.
function computeMigliorPunteggioPositions(teams) {
  return teams.map((t) => {
    const better = teams.filter((o) => o.premiGiornata > t.premiGiornata).length;
    const tied = teams.filter((o) => o.premiGiornata === t.premiGiornata);
    return {
      ...t,
      posizioneMigliorPunteggio: better + 1,
      exEquoMigliorPunteggio: tied.length > 1,
    };
  });
}

// Applica la formula del regolamento e assegna la posizione finale in
// classifica (spareggio sulla posizione scontri diretti, dato che la
// tabella crediti richiede comunque una posizione unica 1-10) e i
// relativi crediti di inizio stagione.
function computeStandings(teams) {
  const withMiglior = computeMigliorPunteggioPositions(teams);

  const withScore = withMiglior.map((t) => ({
    ...t,
    punteggioClassifica: round1(0.8 * t.posizioneScontriDiretti + 0.2 * t.posizioneMigliorPunteggio),
  }));

  const sorted = [...withScore].sort((a, b) => {
    if (a.punteggioClassifica !== b.punteggioClassifica) {
      return a.punteggioClassifica - b.punteggioClassifica;
    }
    return a.posizioneScontriDiretti - b.posizioneScontriDiretti;
  });

  return sorted.map((t, i) => ({
    ...t,
    posizioneClassifica: i + 1,
    creditiInizioStagione: CREDITI_INIZIO_STAGIONE[i + 1],
  }));
}

module.exports = { CREDITI_INIZIO_STAGIONE, computeMigliorPunteggioPositions, computeStandings };
