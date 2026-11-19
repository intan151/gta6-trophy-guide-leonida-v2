// Rendering for the Leonida Ledger v2: the checklist, the trophy detail
// pane, the roadmap to the platinum and the missables page.
//
// Everything here is plain DOM built from the trophy data; nothing is
// fetched at run time except the two JSON files under data/.
//
// v2 additions: the "next up" strip, per-phase progress bars on the
// roadmap, a quick-tip box and previous/next navigation in the detail pane.

import { displayDescription, displayName, isSpoilerHidden, nextUpTrophy, sortTrophies, trophyMatches } from './filters.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function pill(text, cls) {
  return el('span', `pill ${cls || ''}`.trim(), text);
}

function gradePill(grade) {
  return pill(grade, `grade-${grade}`);
}

function kindPill(kind) {
  return pill(kind, `kind-${kind}`);
}

function countLabel(trophy) {
  if (trophy.count === null || trophy.count === undefined) return null;
  if (trophy.count === 100 && trophy.grade === 'gold') return 'PSN tracks: 100% completion';
  return `PSN tracks: ${trophy.count.toLocaleString('en-US')}`;
}

function sourceList(trophy) {
  const sources = el('ul', 'sources');
  for (const s of trophy.sources || []) {
    const item = el('li');
    const link = document.createElement('a');
    link.href = s.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `${s.name} — ${s.url}`;
    item.appendChild(link);
    sources.appendChild(item);
  }
  return sources;
}

// ---- header progress and group counts ------------------------------------

export function updateProgress(trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressPct').textContent = `${pct}% to platinum — ${total - done} to go`;
}

export function renderStats(trophies, earned) {
  const bar = document.getElementById('statsBar');
  bar.replaceChildren();
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earned.has(t.id)) byGrade[t.grade].done += 1;
  }
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const g = byGrade[grade];
    if (!g) continue;
    const chip = el('span', 'stat');
    chip.append(el('span', `grade-${grade}`, `${grade[0].toUpperCase()}${grade.slice(1)} `), el('b', null, `${g.done}/${g.total}`));
    bar.appendChild(chip);
  }
  const kinds = { story: 'Story', collectibles: 'Collectibles', activities: 'Activities' };
  for (const [kind, label] of Object.entries(kinds)) {
    const set = trophies.filter((t) => t.kind === kind);
    const done = set.filter((t) => earned.has(t.id)).length;
    const chip = el('span', 'stat');
    chip.append(el('span', null, `${label} `), el('b', null, `${done}/${set.length}`));
    bar.appendChild(chip);
  }
  const missable = trophies.filter((t) => t.missable);
  const missDone = missable.filter((t) => earned.has(t.id)).length;
  const missChip = el('span', 'stat');
  missChip.append(el('span', null, 'Missable '), el('b', null, `${missDone}/${missable.length}`));
  bar.appendChild(missChip);
  const onlineChip = el('span', 'stat');
  onlineChip.append(el('span', null, 'Online '), el('b', null, '0 — none in the list'));
  bar.appendChild(onlineChip);
}

// The "next up" strip: one line pointing at the next unearned trophy in
// roadmap order. Hidden once every trophy is earned.
export function renderNextUp(trophies, earned, spoilersOn, onSelect) {
  const strip = document.getElementById('nextUp');
  const next = nextUpTrophy(trophies, earned);
  if (!next) {
    strip.hidden = true;
    strip.replaceChildren();
    return;
  }
  strip.hidden = false;
  strip.replaceChildren();
  strip.append(el('b', null, 'Next up: '));
  const link = document.createElement('a');
  link.href = '#checklist';
  link.textContent = displayName(next, spoilersOn, earned);
  link.addEventListener('click', (event) => {
    event.preventDefault();
    onSelect(next.id);
  });
  strip.appendChild(link);
  strip.appendChild(document.createTextNode(` — Phase ${next.phase}, ${next.grade}. ${next.tip || ''}`));
}

// ---- checklist ------------------------------------------------------------

export function renderChecklist(trophies, filters, earned, spoilersOn, selectedId, onToggle, onSelect) {
  const list = document.getElementById('trophyList');
  const meta = document.getElementById('listMeta');
  const empty = document.getElementById('emptyMsg');
  list.replaceChildren();
  const shown = sortTrophies(
    trophies.filter((t) => trophyMatches(t, filters, earned)),
    filters.sort,
  );
  const earnedInView = shown.filter((t) => earned.has(t.id)).length;
  meta.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earnedInView} earned in this view`;
  empty.hidden = shown.length > 0;
  for (const t of shown) {
    const row = el('li', 'trophy');
    if (earned.has(t.id)) row.classList.add('earned');
    if (t.id === selectedId) row.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${displayName(t, spoilersOn, earned)} as earned`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(t.id, box.checked);
    });
    const body = el('div');
    body.appendChild(el('div', 'trophy-name', displayName(t, spoilersOn, earned)));
    body.appendChild(el('div', 'trophy-desc', displayDescription(t, spoilersOn, earned)));
    const tags = el('div', 'trophy-meta');
    tags.appendChild(gradePill(t.grade));
    if (t.kind !== 'platinum') tags.appendChild(kindPill(t.kind));
    if (t.missable) tags.appendChild(pill('⚠ Missable', 'missable'));
    if (t.hidden) tags.appendChild(pill('Hidden on PSN', 'hidden'));
    if (earned.has(t.id)) tags.appendChild(pill('✓ Earned', 'earned-pill'));
    const count = countLabel(t);
    if (count) tags.appendChild(pill(count, ''));
    body.appendChild(tags);
    const dot = el('span', `grade-dot grade-${t.grade}`);
    row.append(box, body, dot);
    row.addEventListener('click', (event) => {
      if (event.target === box) return;
      onSelect(t.id);
    });
    list.appendChild(row);
  }
}

// ---- detail pane ----------------------------------------------------------

export function renderDetail(trophy, trophies, earned, spoilersOn, onToggle, onSelect) {
  const pane = document.getElementById('detailPane');
  pane.replaceChildren();
  if (!trophy) {
    pane.appendChild(el('p', 'detail-hint', 'Select a trophy to read its guide and sources.'));
    return;
  }
  const hidden = isSpoilerHidden(trophy, spoilersOn, earned);
  pane.appendChild(el('h2', null, displayName(trophy, spoilersOn, earned)));
  pane.appendChild(el('p', 'official', displayDescription(trophy, spoilersOn, earned)));
  const tags = el('div', 'trophy-meta');
  tags.appendChild(gradePill(trophy.grade));
  if (trophy.kind !== 'platinum') tags.appendChild(kindPill(trophy.kind));
  if (trophy.missable) tags.appendChild(pill('⚠ Missable', 'missable'));
  if (trophy.hidden) tags.appendChild(pill('Hidden on PSN', 'hidden'));
  pane.appendChild(tags);
  const count = countLabel(trophy);
  if (count) pane.appendChild(el('p', 'count-line', count));
  if (trophy.chapter) pane.appendChild(el('p', 'count-line', `Story: ${trophy.chapter}`));
  if (trophy.missable) {
    pane.appendChild(el('div', 'missable-banner', '⚠ Potentially missable — see the Missables page before you play past Chapter 1.'));
  }
  if (hidden) {
    pane.appendChild(el('p', 'spoiler-text', 'This story trophy is hidden while spoilers are on. Earn it in the game, or switch “Hide story spoilers” off, to read its guide.'));
  } else {
    pane.appendChild(el('h3', null, 'Guide'));
    pane.appendChild(el('p', 'guide-text', trophy.guide));
    if (trophy.tip) {
      const tip = el('p', 'tip');
      tip.append(el('b', null, 'Quick tip: '), document.createTextNode(trophy.tip));
      pane.appendChild(tip);
    }
    pane.appendChild(el('h3', null, 'Sources'));
    pane.appendChild(sourceList(trophy));
  }
  const actions = el('div', 'detail-actions');
  const toggle = el('button', earned.has(trophy.id) ? '' : 'primary', earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => onToggle(trophy.id, !earned.has(trophy.id)));
  actions.appendChild(toggle);
  pane.appendChild(actions);
  // Step to the previous / next trophy in list order without scrolling.
  const idx = trophies.findIndex((t) => t.id === trophy.id);
  const nav = el('div', 'detail-nav');
  const prev = el('button', null, '← Previous trophy');
  prev.type = 'button';
  prev.disabled = idx <= 0;
  prev.addEventListener('click', () => onSelect(trophies[idx - 1].id));
  const next = el('button', null, 'Next trophy →');
  next.type = 'button';
  next.disabled = idx < 0 || idx >= trophies.length - 1;
  next.addEventListener('click', () => onSelect(trophies[idx + 1].id));
  nav.append(prev, next);
  pane.appendChild(nav);
}

// ---- roadmap --------------------------------------------------------------

export function renderRoadmap(roadmap, trophies, earned, spoilersOn) {
  const view = document.getElementById('roadmapView');
  view.replaceChildren();
  const summary = el('div', 'roadmap-summary');
  summary.appendChild(el('h2', null, roadmap.title));
  summary.appendChild(el('p', null, roadmap.summary));
  view.appendChild(summary);
  const byId = new Map(trophies.map((t) => [t.id, t]));
  for (const phase of roadmap.phases) {
    const card = el('section', 'phase');
    const head = el('div', 'phase-head');
    head.appendChild(el('h2', null, phase.title));
    head.appendChild(el('span', 'phase-hours', `${phase.hours} · ${phase.trophyIds.length} trophies`));
    card.appendChild(head);
    card.appendChild(el('p', null, phase.blurb));
    const done = phase.trophyIds.filter((id) => earned.has(id)).length;
    const pct = phase.trophyIds.length ? Math.round((done / phase.trophyIds.length) * 100) : 0;
    const bar = el('div', 'phase-bar');
    bar.appendChild(el('div', 'phase-fill'));
    bar.firstChild.style.width = `${pct}%`;
    card.appendChild(bar);
    card.appendChild(el('p', 'count-line', `${done} of ${phase.trophyIds.length} earned in this phase — ${pct}%`));
    const items = el('ul', 'phase-trophies');
    for (const id of phase.trophyIds) {
      const t = byId.get(id);
      if (!t) continue;
      const item = el('li');
      item.append(el('span', earned.has(id) ? 'done' : '', earned.has(id) ? '✓' : '○'));
      item.appendChild(el('span', 'tname', displayName(t, spoilersOn, earned)));
      item.appendChild(el('span', 'tgrade', t.grade));
      if (t.missable) item.appendChild(pill('⚠ Missable', 'missable'));
      items.appendChild(item);
    }
    card.appendChild(items);
    view.appendChild(card);
  }
  const plat = byId.get(roadmap.platinumId);
  if (plat) {
    const card = el('section', 'phase');
    card.appendChild(el('h2', null, 'The platinum'));
    card.appendChild(el('p', null, `${plat.name} — ${plat.description} Earn the other 54 trophies and it pops on its own.`));
    view.appendChild(card);
  }
}

// ---- missables ------------------------------------------------------------

export function renderMissables(trophies, earned) {
  const view = document.getElementById('missableView');
  view.replaceChildren();
  const intro = el('div', 'missable-intro');
  intro.appendChild(el('h2', null, 'Missable trophies: one to protect'));
  intro.appendChild(el('p', null, 'PowerPyx reports exactly one potentially missable trophy in GTA 6. There is no mission replay, so a missed one-time moment cannot be redone without a new playthrough — which is why this page exists.'));
  const rules = el('ul');
  for (const line of [
    'No mission replay: once a mission is finished, it stays finished. Free roam continues after the story, but missions do not come back.',
    'Saves protect you: the game gives 15 manual save slots plus one autosave. Keep a save at the start and end of each chapter (10 saves).',
    'Cheats disable trophies and saving, so keep cheats off for the whole run.',
    'Everything else can be finished in free roam after the credits.',
  ]) {
    rules.appendChild(el('li', null, line));
  }
  intro.appendChild(rules);
  view.appendChild(intro);
  const missable = trophies.filter((t) => t.missable);
  for (const t of missable) {
    const card = el('div', 'missable-intro');
    card.appendChild(el('h2', null, `⚠ ${t.name} — ${t.grade}`));
    card.appendChild(el('p', null, t.description));
    card.appendChild(el('p', null, t.guide));
    if (t.tip) {
      const tip = el('p', 'tip');
      tip.append(el('b', null, 'Quick tip: '), document.createTextNode(t.tip));
      card.appendChild(tip);
    }
    card.appendChild(sourceList(t));
    card.appendChild(el('p', 'count-line', earned.has(t.id) ? '✓ Earned — you are safe.' : 'Not earned yet — meditate at Jason\'s house before Chapter 1 ends.'));
    view.appendChild(card);
  }
  const safe = el('div', 'missable-intro');
  safe.appendChild(el('h2', null, 'Not missable — confirmed by the sources'));
  const items = el('ul', 'safe-list');
  for (const line of [
    'All 12 story trophies unlock automatically when you finish their chapter or mission.',
    'All collectibles, activities, robberies and challenges can be done in free roam after the story.',
    'The 100% checklist only appears after the story, but progress made earlier already counts.',
  ]) {
    items.appendChild(el('li', null, line));
  }
  safe.appendChild(items);
  view.appendChild(safe);
}
