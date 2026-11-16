import type { AppState } from '../types';
import { timeAgo } from '../util';
import Avatar from './Avatar';
import { FlameIcon, PlusIcon } from './icons';

interface Props {
  state: AppState;
  onOpenStory: (authorId: string, index: number) => void;
  onCompose: () => void;
  onSnap: () => void;
}

export default function Stories({ state, onOpenStory, onCompose, onSnap }: Props) {
  const latest = (authorId: string) => {
    const items = state.stories[authorId] ?? [];
    return [...items].sort((a, b) => b.createdAt - a.createdAt)[0];
  };

  const myStory = state.stories[state.me.id] ?? [];
  const unseen = (authorId: string) =>
    (state.stories[authorId] ?? []).some((item) => !state.seenStoryIds.includes(item.id));

  const storyFriends = state.friends
    .filter((friend) => (state.stories[friend.id] ?? []).length > 0)
    .sort((a, b) => Number(unseen(b.id)) - Number(unseen(a.id)));

  return (
    <>
      <header className="app-header">
        <div>
          <div className="wordmark">
            <span className="wordmark-dot" />
            TGG SNAP
          </div>
          <div className="header-sub">Send it. Then it's gone.</div>
        </div>
        <span className="streak-chip">
          <FlameIcon />
          {state.me.streakBest}
        </span>
      </header>

      <div className="scroll-body">
        <button
          type="button"
          className="story-self"
          onClick={() => (myStory.length ? onOpenStory(state.me.id, 0) : onCompose())}
        >
          {myStory.length ? (
            <>
              <img src={latest(state.me.id)?.media ?? myStory[0].media} alt="" />
              <div className="story-self-overlay">
                <div>
                  <div className="self-title">My Story</div>
                  <div className="self-sub">
                    {myStory.length} snap{myStory.length > 1 ? 's' : ''} · {timeAgo(myStory[0].createdAt)}
                  </div>
                </div>
                <span className="badge-live">Live</span>
              </div>
            </>
          ) : (
            <div className="self-empty">
              <span className="self-plus">
                <PlusIcon />
              </span>
              <span className="self-title">Add to your story</span>
              <span className="self-sub">24 hours, then it's gone</span>
            </div>
          )}
        </button>

        <div className="section-label">
          <span>Following</span>
          <span>{storyFriends.length} live</span>
        </div>

        <div className="story-grid">
          {storyFriends.map((friend) => {
            const item = latest(friend.id);
            if (!item) return null;
            return (
              <button
                key={friend.id}
                type="button"
                className="story-card"
                onClick={() => onOpenStory(friend.id, 0)}
              >
                <img src={item.media} alt="" />
                <span className="story-card-avatar">
                  <Avatar author={friend} size={34} ring={unseen(friend.id) ? 'live' : 'seen'} />
                </span>
                <span className="story-card-body">
                  <span className="story-card-name">{friend.name.split(' ')[0]}</span>
                  <span className="story-card-time">
                    {(state.stories[friend.id] ?? []).length} snap
                    {(state.stories[friend.id] ?? []).length > 1 ? 's' : ''} · {timeAgo(item.createdAt)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="section-label">
          <span>Your crew</span>
          <span>{state.friends.length} people</span>
        </div>

        <div>
          {state.friends.map((friend) => (
            <div key={friend.id} className="crew-row">
              <Avatar author={friend} size={42} ring={unseen(friend.id) ? 'live' : 'none'} />
              <div className="crew-main">
                <div className="crew-name">{friend.name}</div>
                <div className="crew-role">
                  {friend.role} · {friend.note}
                </div>
              </div>
              <div className="crew-side">
                <span className="mini-streak">
                  <FlameIcon />
                  {friend.streak}
                </span>
                <button type="button" className="snap-btn" onClick={onSnap}>
                  Snap
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="empty-note">
          Stories and unopened snaps last 24 hours. Record one from the camera — filters included.
        </p>
      </div>
    </>
  );
}
