import type { AppState } from '../types';
import { timeAgo } from '../util';
import Avatar from './Avatar';
import { FlameIcon } from './icons';

interface Props {
  state: AppState;
  onOpenThread: (friendId: string) => void;
  onOpenStory: (authorId: string) => void;
}

export default function Chat({ state, onOpenThread, onOpenStory }: Props) {
  const rows = state.friends
    .map((friend) => {
      const thread = state.threads[friend.id] ?? [];
      const last = thread[thread.length - 1];
      const snap = last?.snapId ? state.snaps[last.snapId] : undefined;
      const unread = thread.filter((message) => message.fromId !== state.me.id && !message.readAt).length;
      const hasStory = (state.stories[friend.id] ?? []).length > 0;
      const unseen = (state.stories[friend.id] ?? []).some(
        (item) => !state.seenStoryIds.includes(item.id),
      );

      let preview = 'Say something';
      if (last && snap) {
        preview =
          last.fromId === state.me.id
            ? `📸 You sent a snap · ${snap.timer}s`
            : snap.openedAt
              ? '📸 Opened · tap to reply'
              : '📸 New Snap · tap to view';
      } else if (last?.text) {
        preview = last.text;
      }

      return {
        friend,
        preview,
        unread,
        hasStory,
        unseen,
        at: last?.createdAt ?? friend.lastSnapAt,
      };
    })
    .sort((a, b) => b.at - a.at);

  const unreadTotal = rows.reduce((total, row) => total + row.unread, 0);

  return (
    <>
      <header className="app-header">
        <div>
          <div className="wordmark">Chat</div>
          <div className="header-sub">
            {unreadTotal > 0 ? `${unreadTotal} new snap${unreadTotal > 1 ? 's' : ''} waiting` : 'Your crew, on and off the bus'}
          </div>
        </div>
        <span className="streak-chip">
          <FlameIcon />
          {rows.reduce((best, row) => Math.max(best, row.friend.streak), 0)}
        </span>
      </header>

      <div className="scroll-body">
        <div className="chat-rows">
          {rows.map((row) => (
            <div key={row.friend.id} className="chat-row">
              <button
                type="button"
                className="avatar-button"
                onClick={() => (row.hasStory ? onOpenStory(row.friend.id) : onOpenThread(row.friend.id))}
                aria-label={`${row.friend.name} story`}
              >
                <Avatar author={row.friend} size={50} ring={row.hasStory ? (row.unseen ? 'live' : 'seen') : 'none'} />
              </button>
              <button
                type="button"
                className="chat-row-main"
                onClick={() => onOpenThread(row.friend.id)}
                aria-label={`Open chat with ${row.friend.name}`}
              >
                <span className="chat-row-top">
                  <span className="chat-row-name">{row.friend.name}</span>
                  <span className="chat-row-time">{timeAgo(row.at)}</span>
                </span>
                <span className={`chat-row-preview ${row.unread > 0 ? 'is-unread' : ''}`}>{row.preview}</span>
                <span className="chat-row-meta">
                  🔥 {row.friend.streak} day streak · {row.friend.role}
                </span>
              </button>
              <span className="chat-row-badges">
                {row.unread > 0 ? <span className="unread-dot" /> : null}
              </span>
            </div>
          ))}
        </div>
        <p className="empty-note">Tap a snap to open it — the timer starts immediately.</p>
      </div>
    </>
  );
}
