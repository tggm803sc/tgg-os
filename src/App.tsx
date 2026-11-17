import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppState, ChatMessage, Snap, StoryItem } from './types';
import { loadState, loadShell, pruneState, saveShell, saveState } from './store';
import { seedState } from './seed';
import { syntheticSnap } from './media';
import { pick, uid } from './util';
import Camera from './components/Camera';
import Composer from './components/Composer';
import Stories from './components/Stories';
import StoryViewer from './components/StoryViewer';
import Chat from './components/Chat';
import Thread from './components/Thread';
import SnapViewer from './components/SnapViewer';
import Profile from './components/Profile';
import Os from './components/Os';
import { CameraIcon, ChatIcon, ProfileIcon, StoriesIcon } from './components/icons';

type Tab = 'stories' | 'chat' | 'camera' | 'profile';

const TEXT_REPLIES: Record<string, string[]> = {
  sol: [
    'stage was stupid loud tonight 😮‍💨',
    'on the bus, 4am load-in, do not test me',
    'this take is the one, i can feel it',
    'sending you the setlist for friday',
  ],
  dex: [
    'heard that snare 👀',
    'booth is open till 2',
    'send me the stems',
    'this is the take, do not touch it',
  ],
  nia: ['that hook is a single', 'contract is in your inbox', 'playlist meeting friday', 'i need artwork by monday'],
  rook: ['got the shots from the roof', 'light at soundcheck was unreal', 'uploading tonight, promise'],
  theo: ['mixdown v3 is up', 'low end is clean now', 'give me an hour on the vocals'],
};

const CREW_SNAPS = ['BOOTH 3', 'TAKE 47', 'SOUNDCHECK', 'THE BUS', 'ON STAGE', 'MIXDOWN'];

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState() ?? seedState());
  const [shell] = useState(loadShell);
  const [screen, setScreen] = useState<'os' | 'snap'>(shell.screen);
  const [tab, setTab] = useState<Tab>(shell.tab);
  const [draft, setDraft] = useState<string | null>(null);
  const [viewerSnapId, setViewerSnapId] = useState<string | null>(null);
  const [storyView, setStoryView] = useState<{ authorId: string; index: number } | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: string; text: string } | null>(null);

  const timers = useRef<number[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const openThreadRef = useRef<string | null>(null);
  openThreadRef.current = threadId;

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Reopen on the screen and tab the user was last on.
  useEffect(() => {
    saveShell({ screen, tab });
  }, [screen, tab]);

  useEffect(() => {
    const id = window.setInterval(() => setState((prev) => pruneState(prev)), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = useCallback((text: string) => setToast({ id: uid('toast'), text }), []);

  const scheduleReply = useCallback(
    (friendId: string) => {
      const delay = 3200 + Math.random() * 4200;
      const timer = window.setTimeout(() => {
        let sentSnap = false;
        setState((prev) => {
          const friend = prev.friends.find((f) => f.id === friendId);
          if (!friend) return prev;
          const now = Date.now();
          if (Math.random() < 0.5) {
            sentSnap = true;
            const snapId = uid('snap');
            const snap: Snap = {
              id: snapId,
              fromId: friend.id,
              toId: prev.me.id,
              media: syntheticSnap({ kicker: friend.note, title: pick(CREW_SNAPS), hue: friend.hue }),
              caption: '',
              sticker: '',
              timer: 5,
              createdAt: now,
            };
            const message: ChatMessage = {
              id: uid('msg'),
              friendId,
              fromId: friend.id,
              snapId,
              createdAt: now,
            };
            return {
              ...prev,
              snaps: { ...prev.snaps, [snapId]: snap },
              threads: { ...prev.threads, [friendId]: [...(prev.threads[friendId] ?? []), message] },
            };
          }
          const message: ChatMessage = {
            id: uid('msg'),
            friendId,
            fromId: friend.id,
            text: pick(TEXT_REPLIES[friendId] ?? ['👀']),
            createdAt: now,
          };
          return {
            ...prev,
            threads: { ...prev.threads, [friendId]: [...(prev.threads[friendId] ?? []), message] },
          };
        });
        if (openThreadRef.current !== friendId) {
          const friend = stateRef.current.friends.find((f) => f.id === friendId);
          if (friend) {
            notify(`${friend.name.split(' ')[0]} sent you ${sentSnap ? 'a snap 📸' : 'a message'}`);
          }
        }
      }, delay);
      timers.current.push(timer);
    },
    [notify],
  );

  const sendSnap = useCallback(
    (media: string, caption: string, sticker: string, timer: number, toIds: string[], addToStory: boolean) => {
      const now = Date.now();
      setState((prev) => {
        const snaps = { ...prev.snaps };
        const threads = { ...prev.threads };
        for (const toId of toIds) {
          const snapId = uid('snap');
          snaps[snapId] = {
            id: snapId,
            fromId: prev.me.id,
            toId,
            media,
            caption,
            sticker,
            timer,
            createdAt: now,
          };
          threads[toId] = [
            ...(threads[toId] ?? []),
            { id: uid('msg'), friendId: toId, fromId: prev.me.id, snapId, createdAt: now },
          ];
        }
        const stories = { ...prev.stories };
        if (addToStory) {
          const item: StoryItem = {
            id: uid('story'),
            media,
            caption,
            sticker,
            createdAt: now,
            duration: Math.max(3, timer),
          };
          stories[prev.me.id] = [item, ...(stories[prev.me.id] ?? [])];
        }
        const friends = prev.friends.map((friend) =>
          toIds.includes(friend.id)
            ? { ...friend, streak: friend.streak + 1, lastSnapAt: now }
            : friend,
        );
        return pruneState({
          ...prev,
          snaps,
          threads,
          stories,
          friends,
          me: { ...prev.me, snapsSent: prev.me.snapsSent + toIds.length },
        });
      });

      setDraft(null);
      toIds.forEach(scheduleReply);

      const names = stateRef.current.friends
        .filter((friend) => toIds.includes(friend.id))
        .map((friend) => friend.name.split(' ')[0]);

      if (addToStory && !toIds.length) notify('Added to your story');
      else if (addToStory) notify(`Story + ${toIds.length === 1 ? names[0] : `${toIds.length} friends`}`);
      else if (toIds.length === 1) notify(`Sent to ${names[0]}`);
      else notify(`Sent to ${toIds.length} friends`);

      setTab('chat');
    },
    [notify, scheduleReply],
  );

  const openSnap = useCallback((snapId: string) => {
    setState((prev) => {
      const snap = prev.snaps[snapId];
      if (!snap) return prev;
      const needsMark = snap.toId === prev.me.id && !snap.openedAt;
      if (!needsMark) return prev;
      const now = Date.now();
      const threads = { ...prev.threads };
      const list = threads[snap.fromId];
      if (list) {
        threads[snap.fromId] = list.map((message) =>
          message.snapId === snapId ? { ...message, readAt: message.readAt ?? now } : message,
        );
      }
      return {
        ...prev,
        snaps: { ...prev.snaps, [snapId]: { ...snap, openedAt: now } },
        threads,
      };
    });
    setViewerSnapId(snapId);
  }, []);

  const sendText = useCallback(
    (friendId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setState((prev) => ({
        ...prev,
        threads: {
          ...prev.threads,
          [friendId]: [
            ...(prev.threads[friendId] ?? []),
            { id: uid('msg'), friendId, fromId: prev.me.id, text: trimmed, createdAt: Date.now() },
          ],
        },
      }));
      if (Math.random() < 0.6) scheduleReply(friendId);
    },
    [scheduleReply],
  );

  const markStorySeen = useCallback((authorId: string) => {
    setState((prev) => {
      const items = prev.stories[authorId] ?? [];
      const fresh = items.map((item) => item.id).filter((id) => !prev.seenStoryIds.includes(id));
      if (!fresh.length) return prev;
      return { ...prev, seenStoryIds: [...prev.seenStoryIds, ...fresh] };
    });
  }, []);

  const markThreadRead = useCallback((friendId: string) => {
    setState((prev) => {
      const list = prev.threads[friendId];
      if (!list || !list.some((m) => m.fromId !== prev.me.id && !m.readAt)) return prev;
      const now = Date.now();
      return {
        ...prev,
        threads: {
          ...prev.threads,
          [friendId]: list.map((m) =>
            m.fromId !== prev.me.id && !m.readAt ? { ...m, readAt: now } : m,
          ),
        },
      };
    });
  }, []);

  const reset = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setThreadId(null);
    setDraft(null);
    setViewerSnapId(null);
    setStoryView(null);
    setTab('stories');
    setState(seedState());
    notify('Fresh crew, fresh snaps');
  }, [notify]);

  const openThread = useCallback((friendId: string) => {
    setThreadId(friendId);
  }, []);

  const goHome = useCallback(() => {
    setDraft(null);
    setViewerSnapId(null);
    setStoryView(null);
    setThreadId(null);
    setScreen('os');
  }, []);

  useEffect(() => {
    if (threadId) markThreadRead(threadId);
  }, [threadId, markThreadRead, state.threads]);

  const viewerSnap = viewerSnapId ? state.snaps[viewerSnapId] : null;
  const viewerAuthor = viewerSnap
    ? viewerSnap.fromId === state.me.id
      ? state.me
      : state.friends.find((friend) => friend.id === viewerSnap.fromId) ?? null
    : null;

  const storyAuthor = storyView
    ? [state.me, ...state.friends].find((author) => author.id === storyView.authorId) ?? null
    : null;

  const threadFriend = threadId ? state.friends.find((friend) => friend.id === threadId) ?? null : null;

  return (
    <div className="stage">
      <div className="shell">
        {screen === 'os' ? (
          <Os
            onOpenSnap={() => setScreen('snap')}
            streak={state.me.streakBest}
            snapsSent={state.me.snapsSent}
            crew={state.friends.length}
          />
        ) : (
          <>
            <div className="os-chrome">
              <button type="button" className="os-home" onClick={goHome}>
                <span className="os-home-dot" />
                TGG OS
              </button>
              <span className="os-chrome-title">Snap</span>
              <span className="os-chrome-streak">🔥 {state.me.streakBest}</span>
            </div>
            <div className="snap-frame">
        <div className="screen">
          {tab === 'stories' && (
            <Stories
              state={state}
              onOpenStory={(authorId, index) => setStoryView({ authorId, index })}
              onCompose={() => setTab('camera')}
              onSnap={() => setTab('camera')}
            />
          )}
          {tab === 'chat' && (
            <Chat
              state={state}
              onOpenThread={openThread}
              onOpenStory={(authorId) => setStoryView({ authorId, index: 0 })}
            />
          )}
          {tab === 'camera' && <Camera onCapture={(media) => setDraft(media)} onNotify={notify} />}
          {tab === 'profile' && (
            <Profile
              state={state}
              onReset={reset}
              onOpenStory={(authorId) => setStoryView({ authorId, index: 0 })}
            />
          )}
        </div>

        <nav className="tabbar" aria-label="Primary">
          <button
            type="button"
            className={`tab ${tab === 'stories' ? 'is-active' : ''}`}
            onClick={() => setTab('stories')}
            aria-current={tab === 'stories' ? 'page' : undefined}
          >
            <StoriesIcon />
            <span>Stories</span>
          </button>
          <button
            type="button"
            className={`tab ${tab === 'chat' ? 'is-active' : ''}`}
            onClick={() => setTab('chat')}
            aria-current={tab === 'chat' ? 'page' : undefined}
          >
            <ChatIcon />
            <span>Chat</span>
          </button>
          <button
            type="button"
            className={`tab tab-camera ${tab === 'camera' ? 'is-active' : ''}`}
            onClick={() => setTab('camera')}
            aria-label="Camera"
          >
            <span className="shutter-mini">
              <CameraIcon />
            </span>
          </button>
          <button
            type="button"
            className={`tab ${tab === 'profile' ? 'is-active' : ''}`}
            onClick={() => setTab('profile')}
            aria-current={tab === 'profile' ? 'page' : undefined}
          >
            <ProfileIcon />
            <span>You</span>
          </button>
        </nav>

        {draft && (
          <Composer
            media={draft}
            me={state.me}
            friends={state.friends}
            onSend={sendSnap}
            onDiscard={() => setDraft(null)}
          />
        )}

        {viewerSnap && viewerAuthor && (
          <SnapViewer snap={viewerSnap} author={viewerAuthor} onClose={() => setViewerSnapId(null)} />
        )}

        {storyView && storyAuthor && state.stories[storyView.authorId]?.length ? (
          <StoryViewer
            author={storyAuthor}
            items={state.stories[storyView.authorId]}
            startIndex={storyView.index}
            onSeen={() => markStorySeen(storyView.authorId)}
            onClose={() => setStoryView(null)}
          />
        ) : null}

        {threadFriend && (
          <Thread
            state={state}
            friend={threadFriend}
            onBack={() => setThreadId(null)}
            onOpenSnap={openSnap}
            onSendText={sendText}
            onOpenStory={() => setStoryView({ authorId: threadFriend.id, index: 0 })}
            onOpenCamera={() => {
              setThreadId(null);
              setTab('camera');
            }}
          />
        )}
            </div>
          </>
        )}

        {toast && <div className="toast">{toast.text}</div>}
      </div>
    </div>
  );
}
