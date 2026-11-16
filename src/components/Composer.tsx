import { useState } from 'react';
import type { Friend, Me } from '../types';
import { STICKERS } from '../filters';
import { CheckIcon, CloseIcon, PlusIcon, SendIcon } from './icons';
import Avatar from './Avatar';

const TIMERS = [1, 3, 5, 7, 10];

interface Props {
  media: string;
  me: Me;
  friends: Friend[];
  onSend: (
    media: string,
    caption: string,
    sticker: string,
    timer: number,
    toIds: string[],
    addToStory: boolean,
  ) => void;
  onDiscard: () => void;
}

export default function Composer({ media, me, friends, onSend, onDiscard }: Props) {
  const [caption, setCaption] = useState('');
  const [sticker, setSticker] = useState('');
  const [timer, setTimer] = useState(5);
  const [toIds, setToIds] = useState<string[]>([]);
  const [addToStory, setAddToStory] = useState(false);
  const [picking, setPicking] = useState(false);

  const canSend = toIds.length > 0 || addToStory;

  const toggleFriend = (id: string) => {
    setToIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const send = () => {
    if (!canSend) return;
    onSend(media, caption.trim(), sticker, timer, toIds, addToStory);
  };

  return (
    <div className="composer">
      <img className="composer-media" src={media} alt="Your snap" />
      <div className="composer-shade" />

      <div className="composer-top">
        <button type="button" className="ghost-btn" onClick={onDiscard} aria-label="Discard snap">
          <CloseIcon />
        </button>
        <div className="timer-row">
          {TIMERS.map((value) => (
            <button
              key={value}
              type="button"
              className={`timer-pill ${timer === value ? 'is-active' : ''}`}
              onClick={() => setTimer(value)}
            >
              {value}s
            </button>
          ))}
        </div>
      </div>

      {sticker && <div className="composer-sticker">{sticker}</div>}

      <div className="composer-caption">
        <input
          className="caption-input"
          value={caption}
          maxLength={90}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Add a caption…"
          aria-label="Snap caption"
        />
      </div>

      <div className="composer-tools">
        <div className="sticker-strip" aria-label="Stickers">
          {STICKERS.map((value) => (
            <button
              key={value}
              type="button"
              className={`sticker-chip ${sticker === value ? 'is-active' : ''}`}
              onClick={() => setSticker((prev) => (prev === value ? '' : value))}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="composer-bottom">
        <button type="button" className="send-btn" onClick={() => setPicking(true)}>
          <SendIcon />
          Send To
          {toIds.length > 0 && <span className="send-count">{toIds.length}</span>}
        </button>
      </div>

      {picking && (
        <div className="sheet-backdrop" onClick={() => setPicking(false)}>
          <div className="send-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">
              <span>Send to</span>
              <button type="button" className="link-btn" onClick={() => setToIds(friends.map((f) => f.id))}>
                Select all
              </button>
            </div>
            <div className="sheet-list">
              {friends.map((friend) => {
                const selected = toIds.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    className={`sheet-row ${selected ? 'is-selected' : ''}`}
                    onClick={() => toggleFriend(friend.id)}
                  >
                    <Avatar author={friend} size={38} />
                    <span>
                      <span className="sheet-name">{friend.name}</span>
                      <span className="sheet-role">
                        {friend.role} · 🔥 {friend.streak}
                      </span>
                    </span>
                    <span className="sheet-check">{selected && <CheckIcon />}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={`story-toggle ${addToStory ? 'is-on' : ''}`}
              onClick={() => setAddToStory((value) => !value)}
            >
              <PlusIcon />
              Add to My Story
              <span className="sheet-check" style={{ marginLeft: 'auto' }}>
                {addToStory && <CheckIcon />}
              </span>
            </button>

            <div className="sheet-footer">
              <button type="button" className="sheet-cancel" onClick={() => setPicking(false)}>
                Cancel
              </button>
              <button type="button" className="send-btn" onClick={send} disabled={!canSend}>
                {toIds.length === 0
                  ? addToStory
                    ? 'Post to My Story'
                    : 'Pick someone'
                  : `Send to ${toIds.length} ${toIds.length === 1 ? 'friend' : 'friends'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="composer-me">
        <Avatar author={me} size={26} />
        <span>{me.handle}</span>
      </div>
    </div>
  );
}
