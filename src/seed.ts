import type { AppState, ChatMessage, Friend, Me, Snap, StoryItem } from './types';
import { syntheticSnap } from './media';
import { uid } from './util';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export function seedState(): AppState {
  const now = Date.now();

  const me: Me = {
    id: 'me',
    name: 'You',
    handle: '@you',
    emoji: '🎧',
    tint: '#fffc00',
    hue: 54,
    role: 'TGG Records · studio rat',
    streakBest: 41,
    snapsSent: 0,
    joinedAt: now - 120 * 24 * HOUR,
  };

  const friends: Friend[] = [
    {
      id: 'sol',
      name: 'Marisol Vega',
      handle: '@solvga',
      emoji: '🎤',
      tint: '#ff4d8d',
      hue: 335,
      role: 'Artist',
      streak: 41,
      lastSnapAt: now - 2 * HOUR,
      note: 'STUDIO B',
    },
    {
      id: 'dex',
      name: 'Dex Nakamura',
      handle: '@dexthebooth',
      emoji: '🎛️',
      tint: '#4de1ff',
      hue: 190,
      role: 'Producer',
      streak: 12,
      lastSnapAt: now - 9 * HOUR,
      note: 'BOOTH 3',
    },
    {
      id: 'rook',
      name: 'Rook Alvarez',
      handle: '@rookshots',
      emoji: '📷',
      tint: '#7cffb2',
      hue: 150,
      role: 'Tour photographer',
      streak: 23,
      lastSnapAt: now - 30 * MINUTE,
      note: 'SOUNDCHECK',
    },
    {
      id: 'nia',
      name: 'Nia Okonkwo',
      handle: '@niasigns',
      emoji: '📀',
      tint: '#ffd166',
      hue: 45,
      role: 'A&R',
      streak: 7,
      lastSnapAt: now - 26 * HOUR,
      note: 'THE OFFICE',
    },
    {
      id: 'theo',
      name: 'Theo Park',
      handle: '@theodesk',
      emoji: '🎚️',
      tint: '#b39dff',
      hue: 265,
      role: 'Mix engineer',
      streak: 3,
      lastSnapAt: now - 3 * 24 * HOUR,
      note: 'MIX ROOM',
    },
  ];

  const snaps: Record<string, Snap> = {};
  const threads: Record<string, ChatMessage[]> = { sol: [], dex: [], rook: [], nia: [], theo: [] };

  const dexSnap: Snap = {
    id: uid('snap'),
    fromId: 'dex',
    toId: 'me',
    media: syntheticSnap({ kicker: 'BOOTH 3', title: 'LISTEN', hue: 190 }),
    caption: 'new low end. tell me it slaps.',
    sticker: 'IN THE BOOTH',
    timer: 6,
    createdAt: now - 12 * MINUTE,
  };
  snaps[dexSnap.id] = dexSnap;

  threads.dex.push(
    {
      id: uid('msg'),
      friendId: 'dex',
      fromId: 'me',
      text: 'sending you the vocal take now',
      createdAt: now - 42 * MINUTE,
      readAt: now - 41 * MINUTE,
    },
    { id: uid('msg'), friendId: 'dex', fromId: 'dex', snapId: dexSnap.id, createdAt: dexSnap.createdAt },
  );

  threads.sol.push(
    {
      id: uid('msg'),
      friendId: 'sol',
      fromId: 'sol',
      text: 'stage was stupid loud tonight 😮‍💨',
      createdAt: now - 5 * HOUR,
      readAt: now - 5 * HOUR + MINUTE,
    },
    {
      id: uid('msg'),
      friendId: 'sol',
      fromId: 'sol',
      text: 'you coming to the afterparty or what',
      createdAt: now - 5 * HOUR + 4 * MINUTE,
    },
  );

  threads.rook.push({
    id: uid('msg'),
    friendId: 'rook',
    fromId: 'rook',
    text: 'got the roof shots, uploading after load-out',
    createdAt: now - 8 * HOUR,
  });

  threads.theo.push({
    id: uid('msg'),
    friendId: 'theo',
    fromId: 'me',
    text: 'stems are in the drive — v3',
    createdAt: now - 28 * HOUR,
    readAt: now - 27 * HOUR,
  });

  const story = (
    kicker: string,
    title: string,
    hue: number,
    caption: string,
    sticker: string,
    ago: number,
    duration = 5,
  ): StoryItem => ({
    id: uid('story'),
    media: syntheticSnap({ kicker, title, hue }),
    caption,
    sticker,
    createdAt: now - ago,
    duration,
  });

  const stories: Record<string, StoryItem[]> = {
    sol: [
      story('ON THE ROAD', '4AM LOAD-IN', 265, 'they said the bus leaves at 4. it is 4:07.', '', 5 * HOUR),
      story('STUDIO B', 'TAKE 47', 335, 'one more pass and it is done. probably.', 'IN THE BOOTH', 2 * HOUR),
    ],
    dex: [
      story('BOOTH 3', 'MIXDOWN', 190, 'if it sounds good on the laptop it sounds good.', 'TAKE 47', 3 * HOUR),
    ],
    rook: [
      story('SOUNDCHECK', 'STAGE LEFT', 150, 'the light at soundcheck was unreal', '', 40 * MINUTE, 4),
    ],
    nia: [story('THE OFFICE', 'DEMO DROP', 45, 'four demos, one hook that matters.', '', 7 * HOUR, 6)],
  };

  return {
    version: 1,
    me,
    friends,
    threads,
    stories,
    snaps,
    seenStoryIds: [],
    createdAt: now,
  };
}
