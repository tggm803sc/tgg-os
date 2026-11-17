import type { AppState } from './types';

const KEY = 'tgg-snap-v1';
const SHELL_KEY = 'tgg-os-shell-v1';
const DAY = 24 * 60 * 60 * 1000;

export type ShellScreen = 'os' | 'snap';
export type SnapTab = 'stories' | 'chat' | 'camera' | 'profile';

export interface ShellState {
  screen: ShellScreen;
  tab: SnapTab;
}

const SNAP_TABS: SnapTab[] = ['stories', 'chat', 'camera', 'profile'];

/**
 * Where the user left off, so a reload returns them to the same screen.
 * The camera tab is deliberately not restored: mounting it asks the browser
 * for camera access, and that should only happen from a deliberate tap.
 */
export function loadShell(): ShellState {
  const fallback: ShellState = { screen: 'os', tab: 'stories' };
  try {
    const raw = localStorage.getItem(SHELL_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ShellState> | null;
    if (!parsed) return fallback;
    const tab = SNAP_TABS.includes(parsed.tab as SnapTab) ? (parsed.tab as SnapTab) : 'stories';
    return {
      screen: parsed.screen === 'snap' ? 'snap' : 'os',
      tab: tab === 'camera' ? 'stories' : tab,
    };
  } catch {
    return fallback;
  }
}

export function saveShell(shell: ShellState): void {
  try {
    localStorage.setItem(SHELL_KEY, JSON.stringify(shell));
  } catch {
    // Storage blocked or full: navigation still works, it just won't persist.
  }
}

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
