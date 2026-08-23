const ROLES = ['P', 'D', 'C', 'A'];
const MAX_TOTAL = 5;
const MAX_PER_ROLE = { P: 1, D: 2, C: 2, A: 2 };

/**
 * Validates a set of selected players (used for both voting on a target
 * roster and confirming one's own roster). `players` must be the full
 * player rows (id, ruolo, team_id) belonging to the pool the selection is
 * being made from, already filtered to only the candidate roster.
 *
 * @param {number[]} selectedIds - player ids submitted by the form
 * @param {Array<{id:number, ruolo:string}>} eligiblePlayers - players the ids are allowed to come from
 * @returns {{ok:true, ids:number[]}|{ok:false, error:string}}
 */
function validateSelection(selectedIds, eligiblePlayers) {
  const eligibleIds = new Set(eligiblePlayers.map((p) => p.id));
  const dedupedIds = [...new Set(selectedIds.map((id) => Number(id)))].filter((id) =>
    Number.isInteger(id)
  );

  for (const id of dedupedIds) {
    if (!eligibleIds.has(id)) {
      return { ok: false, error: 'Selezione non valida: giocatore non ammissibile.' };
    }
  }

  if (dedupedIds.length > MAX_TOTAL) {
    return { ok: false, error: `Puoi selezionare al massimo ${MAX_TOTAL} giocatori.` };
  }

  const byId = new Map(eligiblePlayers.map((p) => [p.id, p]));
  const countByRole = { P: 0, D: 0, C: 0, A: 0 };
  for (const id of dedupedIds) {
    const ruolo = byId.get(id).ruolo;
    countByRole[ruolo] += 1;
  }

  for (const role of ROLES) {
    if (countByRole[role] > MAX_PER_ROLE[role]) {
      return {
        ok: false,
        error: `Limite superato per il ruolo ${role}: massimo ${MAX_PER_ROLE[role]}.`,
      };
    }
  }

  return { ok: true, ids: dedupedIds };
}

module.exports = { validateSelection, ROLES, MAX_TOTAL, MAX_PER_ROLE };
