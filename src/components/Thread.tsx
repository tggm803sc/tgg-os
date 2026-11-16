import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { AppState, Friend } from '../types';
import { clockTime } from '../util';
import Avatar from './Avatar';
import { BackIcon, CameraIcon, EyeIcon, FlameIcon, SendIcon } from './icons';

interface Props {
  state: AppState;
  friend: Friend;
  onBack: () => void;
  onOpenSnap: (snapId: string) => void;
  onSendText: (friendId: string, text: string) => void;
  onOpenStory: () => void;
  onOpenCamera: () => void;
}

export default function Thread({
  state,
  friend,
  onBack,
  onOpenSnap,
  onSendText,
  onOpenStory,
  onOpenCamera,
}: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const messages = state.threads[friend.id] ?? [];
  const hasStory = (state.stories[friend.id] ?? []).length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSendText(friend.id, text);
    setText('');
  };

  return (
    <section className="thread">
      <header className="thread-header">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back to chats">
          <BackIcon />
        </button>
        <button
          type="button"
          className="avatar-button"
          onClick={() => (hasStory ? onOpenStory() : undefined)}
          aria-label={`${friend.name} story`}
        >
          <Avatar author={friend} size={38} ring={hasStory ? 'live' : 'none'} />
        </button>
        <div className="thread-title">
          <div className="thread-name">
            {friend.name}
            <span className="thread-streak">
              <FlameIcon />
              {friend.streak}
            </span>
          </div>
          <div className="thread-sub">
            {friend.role} · {friend.note}
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={onOpenCamera} aria-label="Send a snap">
          <CameraIcon />
        </button>
      </header>

      <div className="thread-body">
        {messages.length === 0 && (
          <p className="empty-note" style={{ marginTop: 24 }}>
            No snaps yet. Send one — this thread clears a day after it's opened.
          </p>
        )}

        {messages.map((message) => {
          const mine = message.fromId === state.me.id;

          if (message.snapId) {
            const snap = state.snaps[message.snapId];
            if (!snap) {
              return (
                <div key={message.id} className="expired-card">
                  Snap expired
                </div>
              );
            }
            const opened = mine || Boolean(snap.openedAt);
            return (
              <button
                key={message.id}
                type="button"
                className={`snap-card ${mine ? 'mine' : ''}`}
                onClick={() => onOpenSnap(snap.id)}
              >
                {opened ? (
                  <img className="snap-card-thumb" src={snap.media} alt="" />
                ) : (
                  <span className="snap-card-closed">
                    <EyeIcon />
                  </span>
                )}
                <span className="snap-card-label">
                  <span>{mine ? 'You sent a snap' : opened ? 'Opened snap' : 'New snap'}</span>
                  <span className="snap-timer">{snap.timer}s</span>
                </span>
                {snap.caption && <span className="snap-caption">{snap.caption}</span>}
                <span className="bubble-time">{clockTime(message.createdAt)}</span>
              </button>
            );
          }

          return (
            <div key={message.id} className={`bubble ${mine ? 'mine' : 'theirs'}`}>
              {message.text}
              <span className="bubble-time">{clockTime(message.createdAt)}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form className="thread-foot" onSubmit={submit}>
        <input
          className="thread-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Chat with ${friend.name.split(' ')[0]}`}
          aria-label="Message"
        />
        <button type="submit" className="round-send" aria-label="Send message" disabled={!text.trim()}>
          <SendIcon />
        </button>
      </form>
    </section>
  );
}
