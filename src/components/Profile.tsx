import { useState } from 'react';
import type { AppState } from '../types';
import { SUITE_APPS, statusLabel } from '../suite';
import Avatar from './Avatar';
import { FlameIcon } from './icons';

interface Props {
  state: AppState;
  onReset: () => void;
  onOpenStory: (authorId: string) => void;
}

export default function Profile({ state, onReset, onOpenStory }: Props) {
  const [confirming, setConfirming] = useState(false);
  const stories = state.stories[state.me.id] ?? [];
  const mySnaps = Object.values(state.snaps).filter((snap) => snap.fromId === state.me.id).length;

  return (
    <>
      <header className="app-header">
        <div>
          <div className="wordmark">You</div>
          <div className="header-sub">Your corner of the studio</div>
        </div>
        <span className="streak-chip">
          <FlameIcon />
          {state.me.streakBest}
        </span>
      </header>

      <div className="scroll-body">
        <div className="profile-card">
          <button
            type="button"
            className="avatar-button"
            onClick={() => stories.length && onOpenStory(state.me.id)}
            aria-label="View my story"
          >
            <Avatar author={state.me} size={64} ring={stories.length ? 'live' : 'none'} />
          </button>
          <div>
            <div className="profile-name">You</div>
            <div className="profile-handle">{state.me.handle}</div>
            <div className="profile-role">{state.me.role}</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value">{state.me.snapsSent}</div>
            <div className="stat-label">Snaps sent</div>
          </div>
          <div className="stat">
            <div className="stat-value">{state.me.streakBest}</div>
            <div className="stat-label">Best streak</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stories.length + mySnaps}</div>
            <div className="stat-label">In the air</div>
          </div>
        </div>

        <div className="section-label">
          <span>The crew</span>
          <span>{state.friends.length} people</span>
        </div>

        {state.friends.map((friend) => (
          <div key={friend.id} className="crew-row">
            <Avatar author={friend} size={40} />
            <div className="crew-main">
              <div className="crew-name">
                {friend.name} <span className="crew-handle">{friend.handle}</span>
              </div>
              <div className="crew-role">{friend.role}</div>
            </div>
            <span className="mini-streak">
              <FlameIcon />
              {friend.streak}
            </span>
          </div>
        ))}

        <div className="section-label">
          <span>TGG suite</span>
          <span>{SUITE_APPS.length} apps</span>
        </div>

        <div className="suite-list">
          {SUITE_APPS.map((app) => {
            const body = (
              <>
                <span
                  className="suite-icon"
                  style={{ background: `linear-gradient(140deg, ${app.tint}, rgba(10,10,14,.92))` }}
                >
                  {app.icon}
                </span>
                <span className="suite-main">
                  <span className="suite-name">{app.name}</span>
                  <span className="suite-blurb">{app.blurb}</span>
                </span>
                <span className="suite-tag">{statusLabel(app.status)}</span>
              </>
            );

            return app.url ? (
              <a key={app.name} className="suite-row" href={app.url} target="_blank" rel="noreferrer">
                {body}
              </a>
            ) : (
              <div key={app.name} className="suite-row is-current">
                {body}
              </div>
            );
          })}
        </div>

        <div className="about-card">
          <strong>TGG Snap</strong> is a local demo. Your snaps, stories, chats and streaks live in
          this browser and expire after 24 hours. The crew's replies are simulated so you can see the
          whole loop — camera, filters, timer, story, streak.
        </div>

        {confirming ? (
          <div className="confirm-row">
            <button
              type="button"
              className="danger-btn"
              onClick={() => {
                onReset();
                setConfirming(false);
              }}
            >
              Yes, reset everything
            </button>
            <button type="button" className="link-btn" onClick={() => setConfirming(false)}>
              Keep my snaps
            </button>
          </div>
        ) : (
          <button type="button" className="danger-btn" onClick={() => setConfirming(true)}>
            Reset demo
          </button>
        )}
      </div>
    </>
  );
}
