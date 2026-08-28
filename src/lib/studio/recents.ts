export type StudioRecent = {
  id: string;
  title: string;
  brief: string;
  html: string;
  code: string;
  at: number;
};

const RECENTS_KEY = "cozy-studio-recents";
const STARRED_KEY = "cozy-studio-starred";
const MAX_RECENTS = 8;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadRecents(): StudioRecent[] {
  const list = readJson<StudioRecent[]>(RECENTS_KEY, []);
  return Array.isArray(list) ? list.slice(0, MAX_RECENTS) : [];
}

export function addRecent(entry: Omit<StudioRecent, "id" | "at"> & { id?: string }) {
  const id = entry.id ?? crypto.randomUUID();
  const next: StudioRecent = {
    id,
    title: entry.title,
    brief: entry.brief,
    html: entry.html,
    code: entry.code,
    at: Date.now(),
  };
  const prev = loadRecents().filter((r) => r.id !== id && r.title !== entry.title);
  const merged = [next, ...prev].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(merged));
  } catch {
    /* quota */
  }
  return merged;
}

export function loadStarredIds(): Set<string> {
  const ids = readJson<string[]>(STARRED_KEY, []);
  return new Set(Array.isArray(ids) ? ids : []);
}

export function toggleStarred(id: string): Set<string> {
  const set = loadStarredIds();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  try {
    localStorage.setItem(STARRED_KEY, JSON.stringify([...set]));
  } catch {
    /* quota */
  }
  return set;
}
