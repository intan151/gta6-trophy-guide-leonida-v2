// Boot for the Leonida Ledger v2: loads the trophy and roadmap data, wires
// the filters, sorting, spoiler setting, export/import and the three views
// (checklist / roadmap / missables), then renders.
//
// Query helpers for screenshots and deep links: ?seed=demo pre-ticks 13
// trophies when nothing is saved yet; ?view=roadmap or ?view=missable opens
// that view; ?trophy=<id> opens a trophy's guide in the detail pane;
// ?grade=gold, ?kind=missable, ?q=meditate, ?earned=unearned and ?sort=name
// pre-set the filters; ?spoilers=off reveals the story trophies.

import { exportProgress, importProgressFile, loadEarned, loadSpoilersOn, saveEarned, saveSpoilersOn, seedDemoIfEmpty } from './store.js';
import { renderChecklist, renderDetail, renderMissables, renderNextUp, renderRoadmap, renderStats, updateProgress } from './views.js';

const params = new URLSearchParams(location.search);
const state = {
  trophies: [],
  roadmap: null,
  earned: loadEarned(),
  spoilersOn: loadSpoilersOn(),
  selectedId: null,
  view: 'checklist',
  filters: { grade: 'all', kind: 'all', earned: 'all', query: '', missableOnly: false, sort: 'grade' },
};

if (params.get('seed') === 'demo') {
  state.earned = seedDemoIfEmpty(state.earned);
}

const trophyList = document.getElementById('trophyList');
const detailPane = document.getElementById('detailPane');
const roadmapView = document.getElementById('roadmapView');
const missableView = document.getElementById('missableView');
const layout = document.querySelector('.layout');
const toolbar = document.querySelector('.toolbar');
const statsBar = document.getElementById('statsBar');
const nextUp = document.getElementById('nextUp');

function renderAll() {
  updateProgress(state.trophies, state.earned);
  renderStats(state.trophies, state.earned);
  renderNextUp(state.trophies, state.earned, state.spoilersOn, onSelect);
  if (state.view === 'checklist') {
    renderChecklist(state.trophies, state.filters, state.earned, state.spoilersOn, state.selectedId, onToggleEarned, onSelect);
    const selected = state.trophies.find((t) => t.id === state.selectedId) || null;
    renderDetail(selected, state.trophies, state.earned, state.spoilersOn, onToggleEarned, onSelect);
  } else if (state.view === 'roadmap') {
    renderRoadmap(state.roadmap, state.trophies, state.earned, state.spoilersOn);
  } else if (state.view === 'missable') {
    renderMissables(state.trophies, state.earned);
  }
}

function setView(view) {
  state.view = view;
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  const isChecklist = view === 'checklist';
  layout.hidden = !isChecklist;
  toolbar.hidden = !isChecklist;
  statsBar.hidden = !isChecklist;
  nextUp.hidden = !isChecklist;
  roadmapView.hidden = view !== 'roadmap';
  missableView.hidden = view !== 'missable';
  renderAll();
}

function onToggleEarned(id, earnedNow) {
  if (earnedNow) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  renderAll();
}

function onSelect(id) {
  state.selectedId = id;
  if (state.view !== 'checklist') setView('checklist');
  else renderAll();
  detailPane.scrollIntoView({ block: 'nearest' });
}

function readFiltersFromInputs() {
  state.filters.grade = document.getElementById('gradeFilter').value;
  state.filters.kind = document.getElementById('kindFilter').value;
  state.filters.earned = document.getElementById('earnedFilter').value;
  state.filters.sort = document.getElementById('sortOrder').value;
  state.filters.query = document.getElementById('searchBox').value.trim().toLowerCase();
  state.filters.missableOnly = document.getElementById('missableOnly').checked;
}

function resetFilters() {
  document.getElementById('gradeFilter').value = 'all';
  document.getElementById('kindFilter').value = 'all';
  document.getElementById('earnedFilter').value = 'all';
  document.getElementById('sortOrder').value = 'grade';
  document.getElementById('searchBox').value = '';
  document.getElementById('missableOnly').checked = false;
  readFiltersFromInputs();
  renderAll();
}

// Deep links for filters (?grade=gold, ?kind=missable, ?q=meditate,
// ?earned=unearned, ?sort=phase): used by screenshots and shareable links.
function applyFilterParams() {
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) {
    document.getElementById('gradeFilter').value = grade;
  }
  const kind = params.get('kind');
  if (kind && ['story', 'missable', 'collectibles', 'activities', 'online'].includes(kind)) {
    document.getElementById('kindFilter').value = kind;
  }
  const earned = params.get('earned');
  if (earned && ['earned', 'unearned'].includes(earned)) {
    document.getElementById('earnedFilter').value = earned;
  }
  const sort = params.get('sort');
  if (sort && ['grade', 'phase', 'name', 'count'].includes(sort)) {
    document.getElementById('sortOrder').value = sort;
  }
  const q = params.get('q');
  if (q) document.getElementById('searchBox').value = q;
  if (params.get('spoilers') === 'off') {
    state.spoilersOn = false;
    document.getElementById('spoilerToggle').checked = false;
    saveSpoilersOn(false);
  }
  readFiltersFromInputs();
}

function bindControls() {
  for (const id of ['gradeFilter', 'kindFilter', 'earnedFilter', 'missableOnly', 'sortOrder']) {
    document.getElementById(id).addEventListener('change', () => { readFiltersFromInputs(); renderAll(); });
  }
  document.getElementById('searchBox').addEventListener('input', () => { readFiltersFromInputs(); renderAll(); });
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = state.spoilersOn;
  spoiler.addEventListener('change', () => {
    state.spoilersOn = spoiler.checked;
    saveSpoilersOn(state.spoilersOn);
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));
  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    importProgressFile(file)
      .then((earned) => { state.earned = earned; renderAll(); })
      .catch((error) => alert(`Could not import that file: ${error.message}`))
      .finally(() => { importFile.value = ''; });
  });
  window.addEventListener('hashchange', () => {
    const view = location.hash.replace('#', '') || 'checklist';
    if (['checklist', 'roadmap', 'missable'].includes(view)) setView(view);
  });
}

async function boot() {
  const [trophyData, roadmapData] = await Promise.all([
    fetch('./data/trophies.json').then((r) => r.json()),
    fetch('./data/roadmap.json').then((r) => r.json()),
  ]);
  state.trophies = trophyData.trophies;
  state.roadmap = roadmapData;
  bindControls();
  applyFilterParams();
  const trophyParam = Number.parseInt(params.get('trophy') || '', 10);
  if (Number.isInteger(trophyParam) && state.trophies.some((t) => t.id === trophyParam)) {
    state.selectedId = trophyParam;
  } else {
    // Default the detail pane to the one missable trophy: it is the guide's
    // most important single trophy.
    state.selectedId = 28;
  }
  const viewParam = params.get('view');
  const hashView = location.hash.replace('#', '');
  const startView = ['checklist', 'roadmap', 'missable'].includes(viewParam)
    ? viewParam
    : ['checklist', 'roadmap', 'missable'].includes(hashView) ? hashView : 'checklist';
  setView(startView);
}

boot().catch((error) => {
  trophyList.innerHTML = '';
  detailPane.textContent = `Could not load the trophy data: ${error.message}`;
});
