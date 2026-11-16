export interface SnapFilter {
  id: string;
  name: string;
  css: string;
  swatch: string;
}

export const FILTERS: SnapFilter[] = [
  { id: 'clean', name: 'Clean', css: 'none', swatch: 'linear-gradient(135deg, #3a3a3f, #0f0f12)' },
  {
    id: 'booth',
    name: 'Booth',
    css: 'contrast(1.14) saturate(1.22) brightness(0.94) sepia(0.12)',
    swatch: 'linear-gradient(135deg, #2b1a3d, #ff4d8d)',
  },
  {
    id: 'tour',
    name: 'Tour Bus',
    css: 'sepia(0.42) contrast(1.04) brightness(1.06) saturate(0.92)',
    swatch: 'linear-gradient(135deg, #7a5b2a, #f5d59b)',
  },
  {
    id: 'stage',
    name: 'Stage Lights',
    css: 'saturate(1.65) contrast(1.18) hue-rotate(-10deg)',
    swatch: 'linear-gradient(135deg, #4b00ff, #00e0ff)',
  },
  {
    id: 'tape',
    name: 'Tape Warm',
    css: 'sepia(0.55) saturate(1.35) contrast(1.08) brightness(1.02)',
    swatch: 'linear-gradient(135deg, #8a4b12, #ffb347)',
  },
  {
    id: 'afterhours',
    name: 'After Hours',
    css: 'grayscale(0.85) contrast(1.24) brightness(0.92)',
    swatch: 'linear-gradient(135deg, #111, #b9b9c4)',
  },
];

export const STICKERS = [
  'ON TOUR',
  'IN THE BOOTH',
  'SOLD OUT',
  'LOAD-IN 5AM',
  'TAKE 47',
  'NO SLEEP',
  'STAGE LEFT',
  'DEMO MODE',
];

export function filterById(id: string): SnapFilter {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}
