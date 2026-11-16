export interface Author {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  tint: string;
  hue: number;
  role: string;
}

export interface Me extends Author {
  streakBest: number;
  snapsSent: number;
  joinedAt: number;
}

export interface Friend extends Author {
  streak: number;
  lastSnapAt: number;
  note: string;
}

export interface StoryItem {
  id: string;
  media: string;
  caption: string;
  sticker: string;
  createdAt: number;
  duration: number;
}

export interface Snap {
  id: string;
  fromId: string;
  toId: string;
  media: string;
  caption: string;
  sticker: string;
  timer: number;
  createdAt: number;
  openedAt?: number;
}

export interface ChatMessage {
  id: string;
  friendId: string;
  fromId: string;
  text?: string;
  snapId?: string;
  createdAt: number;
  readAt?: number;
}

export interface AppState {
  version: number;
  me: Me;
  friends: Friend[];
  threads: Record<string, ChatMessage[]>;
  stories: Record<string, StoryItem[]>;
  snaps: Record<string, Snap>;
  seenStoryIds: string[];
  createdAt: number;
}
