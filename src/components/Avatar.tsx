import type { Author } from '../types';

interface Props {
  author: Author;
  size?: number;
  ring?: 'none' | 'live' | 'seen';
}

export default function Avatar({ author, size = 46, ring = 'none' }: Props) {
  return (
    <span
      className={`avatar ${ring === 'live' ? 'ring-live' : ring === 'seen' ? 'ring-seen' : ''}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, ${author.tint}, rgba(10,10,14,.85))`,
      }}
      aria-hidden="true"
    >
      <span className="avatar-emoji" style={{ fontSize: Math.round(size * 0.44) }}>
        {author.emoji}
      </span>
    </span>
  );
}
