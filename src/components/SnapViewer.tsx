import { useEffect, useRef, useState } from 'react';
import type { Author, Snap } from '../types';
import { timeAgo } from '../util';
import Avatar from './Avatar';
import { CloseIcon, TimerIcon } from './icons';

interface Props {
  snap: Snap;
  author: Author;
  onClose: () => void;
}

export default function SnapViewer({ snap, author, onClose }: Props) {
  const [remaining, setRemaining] = useState(snap.timer);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    setRemaining(snap.timer);
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, snap.timer - (Date.now() - started) / 1000);
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        closeRef.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [snap.id, snap.timer]);

  const pct = Math.max(0, Math.min(100, (remaining / snap.timer) * 100));

  return (
    <div className="viewer" onClick={onClose}>
      <div className="viewer-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <img className="viewer-media" src={snap.media} alt="" />
      <div className="viewer-shade" />

      <div className="viewer-top">
        <div className="viewer-author">
          <Avatar author={author} size={34} />
          <div>
            <div className="viewer-name">{author.name}</div>
            <div className="viewer-meta">{timeAgo(snap.createdAt)} · {snap.timer}s snap</div>
          </div>
          <button
            type="button"
            className="viewer-close"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label="Close snap"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <span className="viewer-timer">
        <TimerIcon />
        {Math.ceil(remaining)}s
      </span>

      {snap.sticker && <div className="viewer-sticker">{snap.sticker}</div>}
      {snap.caption && <div className="viewer-caption">{snap.caption}</div>}
    </div>
  );
}
