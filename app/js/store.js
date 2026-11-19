// Saved progress for the Leonida Ledger v2: localStorage, export and import.
//
// Progress is the set of earned trophy ids, kept under one key (a v2 key,
// so a v1 demo save never leaks into this build). Export writes that set
// to a JSON file; import reads one back. A ?seed=demo query pre-ticks a
// small demo set so screenshots can show progress — it only applies when
// nothing is saved yet.

export const STORAGE_KEY = 'gta6-trophy-guide-leonida/v2';
export const SPOILER_KEY = 'gta6-trophy-guide-leonida/spoilers-v2';

// A plausible early run: the opening missions, the first activities and a
// few exploration trophies, including the one missable meditation in Chapter 1.
export const DEMO_EARNED = [2, 3, 8, 15, 16, 20, 21, 28, 35, 42, 44, 46, 55];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.earned)) return new Set();
    return new Set(data.earned.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), savedAt: new Date().toISOString() }));
  } catch {
    // Private mode or full storage: the checklist still works in memory.
  }
}

export function seedDemoIfEmpty(earned) {
  if (earned.size === 0) {
    const seeded = new Set(DEMO_EARNED);
    saveEarned(seeded);
    return seeded;
  }
  return earned;
}

export function loadSpoilersOn() {
  try {
    const raw = localStorage.getItem(SPOILER_KEY);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function saveSpoilersOn(on) {
  try {
    localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
  } catch {
    // Ignore: the toggle still works for this visit.
  }
}

export function exportProgress(earned) {
  const blob = new Blob(
    [JSON.stringify({ app: 'gta6-trophy-guide-leonida-v2', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress-v2.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importProgressFile(file) {
  return file.text().then((text) => {
    const data = JSON.parse(text);
    const ids = data && Array.isArray(data.earned) ? data.earned : null;
    if (!ids) throw new Error('That file has no earned list.');
    const earned = new Set(ids.filter((id) => Number.isInteger(id)));
    saveEarned(earned);
    return earned;
  });
}
