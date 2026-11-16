import { useCallback, useEffect, useRef, useState } from 'react';
import type { Author, StoryItem } from '../types';
import { timeAgo } from '../util';
import Avatar from './Avatar';
import { CloseIcon } from './icons';

interface Props {
  author: Author;
  items: StoryItem[];
  startIndex: number;
  onSeen: () => void;
  onClose: () => void;
}

export default function StoryViewer({ author, items, startIndex, onSeen, onClose }: Props) {
  const [index, setIndex] = useState(() => Math.min(Math.max(0, startIndex), Math.max(0, items.length - 1)));
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const seenRef = useRef(onSeen);
  seenRef.current = onSeen;

  useEffect(() => {
    seenRef.current();
  }, [index]);

  const next = useCallback(() => {
    setIndex((current) => {
      if (current < items.length - 1) return current + 1;
      closeRef.current();
      return current;
    });
  }, [items.length]);

  const duration = items[index]?.duration ?? 5;

  useEffect(() => {
    const id = window.setTimeout(next, duration * 1000);
    return () => window.clearTimeout(id);
  }, [index, duration, next]);

  const item = items[index];
  if (!item) return null;

  return (
    <div className="viewer">
      <img className="viewer-media" src={item.media} alt="" />
      <div className="viewer-shade" />

      <div className="story-zones">
        <button
          type="button"
          className="story-zone left"
          aria-label="Previous story"
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
        />
        <button type="button" className="story-zone" aria-label="Next story" onClick={next} />
      </div>

      <div className="viewer-top">
        <div className="viewer-progress">
          {items.map((entry, position) => (
            <span
              key={entry.id}
              className={`seg ${position < index ? 'done' : ''} ${position === index ? 'active' : ''}`}
            >
              {position === index && (
                <span key={`${entry.id}-${index}`} style={{ animationDuration: `${entry.duration}s` }} />
              )}
            </span>
          ))}
        </div>
        <div className="viewer-author">
          <Avatar author={author} size={34} />
          <div>
            <div className="viewer-name">{author.id === 'me' ? 'My Story' : author.name}</div>
            <div className="viewer-meta">
              {timeAgo(item.createdAt)} · {index + 1}/{items.length}
            </div>
          </div>
          <button type="button" className="viewer-close" onClick={onClose} aria-label="Close story">
            <CloseIcon />
          </button>
        </div>
      </div>

      {item.sticker && <div className="viewer-sticker">{item.sticker}</div>}
      {item.caption && <div className="viewer-caption">{item.caption}</div>}
    </div>
  );
}
