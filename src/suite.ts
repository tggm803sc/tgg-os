export type SuiteStatus = 'in-os' | 'live' | 'offline' | 'device';

export interface SuiteApp {
  name: string;
  blurb: string;
  tag: string;
  icon: string;
  tint: string;
  url: string;
  status: SuiteStatus;
}

/** Every TGG app, so one OS reaches the whole suite. */
export const SUITE_APPS: SuiteApp[] = [
  {
    name: 'TGG Snap',
    blurb: 'Snaps, stories and streaks from the booth.',
    tag: 'Snap',
    icon: '📸',
    tint: '#fffc00',
    url: '',
    status: 'in-os',
  },
  {
    name: 'TGG World',
    blurb: 'Open-world music-industry game, Act I.',
    tag: 'Game',
    icon: '🎮',
    tint: '#7cffb2',
    url: 'https://site-06b1aca5210f4581b3dbed8a0d482c87.freebuff.page',
    status: 'live',
  },
  {
    name: 'TGG World VM',
    blurb: 'Runs the TGGWORLD build in a virtual Android on your phone.',
    tag: 'Device',
    icon: '🖥️',
    tint: '#a78bfa',
    url: '',
    status: 'device',
  },
  {
    name: 'TGG Phone',
    blurb: 'The in-world phone. Parked while this OS uses the slot.',
    tag: 'Tool',
    icon: '📱',
    tint: '#4de1ff',
    url: '',
    status: 'offline',
  },
  {
    name: 'TGG Reels',
    blurb: 'Short-form video studio.',
    tag: 'Video',
    icon: '🎬',
    tint: '#ff4d8d',
    url: 'https://site-db99a68e0ff74fa8b1dd92c222aa2ca8.freebuff.page',
    status: 'live',
  },
  {
    name: 'TGG Suno',
    blurb: 'Song generation workspace.',
    tag: 'Audio',
    icon: '🎵',
    tint: '#b39dff',
    url: 'https://site-2a1765ed52884bd4ae871ed942404ba0.freebuff.page',
    status: 'live',
  },
  {
    name: 'TGG AI Impact Desk',
    blurb: 'Industry intelligence desk and report.',
    tag: 'News',
    icon: '📊',
    tint: '#ff9a4d',
    url: 'https://site-16ce126d091a4f96a04895dfa0ac0dda.freebuff.page',
    status: 'live',
  },
  {
    name: 'TGG Studio Download',
    blurb: 'Android build of the studio.',
    tag: 'Download',
    icon: '📦',
    tint: '#ffd166',
    url: 'https://site-363c68e932f2463e9a132c0126332b2a.freebuff.page',
    status: 'live',
  },
];

export const LIVE_APPS = SUITE_APPS.filter((app) => app.status === 'live');

import apkMeta from './apk-meta.json';

export const STUDIO_PAGE_URL = 'https://site-363c68e932f2463e9a132c0126332b2a.freebuff.page';
export const STUDIO_APK_URL = `${STUDIO_PAGE_URL}/TGG-World-Studio.apk`;

// Refreshed before every build by scripts/apk-meta.mjs (npm run apk:meta to force).
export const STUDIO_APK_VERSION = apkMeta.versionName;
export const STUDIO_APK_BUILD = apkMeta.versionCode;
export const STUDIO_APK_SIZE = apkMeta.sizeLabel;
export const STUDIO_APK_PACKAGE = apkMeta.package;

export function statusLabel(status: SuiteStatus): string {
  if (status === 'in-os') return 'Inside';
  if (status === 'live') return 'Live';
  if (status === 'device') return 'On phone';
  return 'Parked';
}
