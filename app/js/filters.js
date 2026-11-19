// Filtering, sorting and the spoiler rule for the trophy checklist.
//
// A trophy passes when it matches every active filter: grade, kind
// (story / missable / collectibles / activities / online), text search and
// the earned/unearned switch. The spoiler rule is separate: while spoilers
// are on, a story trophy that is not earned yet shows a masked name and
// description instead of the real ones — but it still shows its roadmap
// phase, so you can plan around it without seeing the spoiler.
//
// v2: the search also matches the guide and quick tip, and the list can be
// sorted by grade, roadmap phase, name or PSN-tracked count.

export const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function trophyMatches(trophy, filters, earned) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind !== 'all') {
    if (filters.kind === 'missable' && !trophy.missable) return false;
    else if (filters.kind === 'online') return false; // the official list has no online trophies
    else if (filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
  }
  if (filters.earned === 'earned' && !earned.has(trophy.id)) return false;
  if (filters.earned === 'unearned' && earned.has(trophy.id)) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide || ''} ${trophy.tip || ''}`.toLowerCase();
    if (!hay.includes(filters.query)) return false;
  }
  return true;
}

// Sort the already-filtered list. Every sort keeps the trophy's list
// order (id) as the tiebreak, except name sort, which is alphabetical.
export function sortTrophies(list, sort) {
  const copy = [...list];
  if (sort === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'phase') {
    copy.sort((a, b) => (a.phase - b.phase) || (a.id - b.id));
  } else if (sort === 'count') {
    copy.sort((a, b) => ((b.count || 0) - (a.count || 0)) || (a.id - b.id));
  } else {
    copy.sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id));
  }
  return copy;
}

// The next trophy to chase: the earliest roadmap phase with an unearned
// trophy, lowest id inside that phase. The platinum itself is skipped —
// it pops on its own when the other 54 are done.
export function nextUpTrophy(trophies, earned) {
  const rest = trophies.filter((t) => t.id !== 1 && !earned.has(t.id));
  if (rest.length === 0) return null;
  rest.sort((a, b) => (a.phase - b.phase) || (a.id - b.id));
  return rest[0];
}

export function isSpoilerHidden(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function displayName(trophy, spoilersOn, earned) {
  if (!isSpoilerHidden(trophy, spoilersOn, earned)) return trophy.name;
  const phase = trophy.phase ? ` · Phase ${trophy.phase}` : '';
  return `Hidden story trophy${phase}`;
}

export function displayDescription(trophy, spoilersOn, earned) {
  return isSpoilerHidden(trophy, spoilersOn, earned)
    ? 'Hidden on PlayStation until earned. Earn it, or switch spoilers off, to reveal it.'
    : trophy.description;
}
