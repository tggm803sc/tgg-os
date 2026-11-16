import type { AppState } from './types';

const KEY = 'tgg-snap-v1';
const DAY = 24 * 60 * 60 * 1000;

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !parsed.me || !Array.isArray(parsed.friends) || !parsed.threads) return null;
    return pruneState(parsed);
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage quota: free the oldest opened snaps and try once more.
    try {
      localStorage.setItem(KEY, JSON.stringify(trimOldest(state)));
    } catch {
      // Storage unavailable — the session still works in memory.
    }
  }
}

/** Drops stories and watched snaps once their 24 hours are up. */
export function pruneState(state: AppState): AppState {
  const now = Date.now();

  const stories: AppState['stories'] = {};
  for (const [authorId, items] of Object.entries(state.stories ?? {})) {
    const live = items.filter((item) => now - item.createdAt < DAY);
    if (live.length) stories[authorId] = live;
  }

  const snaps: AppState['snaps'] = {};
  for (const [id, snap] of Object.entries(state.snaps ?? {})) {
    if (!snap.openedAt || now - snap.openedAt < DAY) snaps[id] = snap;
  }

  const liveStoryIds = new Set(Object.values(stories).flat().map((item) => item.id));
  const threads: AppState['threads'] = {};
  for (const [friendId, messages] of Object.entries(state.threads ?? {})) {
    threads[friendId] = messages.filter((message) => !message.snapId || snaps[message.snapId]);
  }

  return {
    ...state,
    stories,
    snaps,
    threads,
    seenStoryIds: (state.seenStoryIds ?? []).filter((id) => liveStoryIds.has(id)),
  };
}

function trimOldest(state: AppState): AppState {
  const opened = Object.values(state.snaps)
    .filter((snap) => snap.openedAt)
    .sort((a, b) => (a.openedAt ?? 0) - (b.openedAt ?? 0));

  const drop = new Set(opened.slice(0, Math.ceil(opened.length / 2)).map((snap) => snap.id));
  const snaps: AppState['snaps'] = {};
  for (const [id, snap] of Object.entries(state.snaps)) {
    if (!drop.has(id)) snaps[id] = snap;
  }

  const threads: AppState['threads'] = {};
  for (const [friendId, messages] of Object.entries(state.threads)) {
    threads[friendId] = messages.filter((message) => !message.snapId || snaps[message.snapId]);
  }

  return { ...state, snaps, threads };
}
