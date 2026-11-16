import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FILTERS, filterById } from '../filters';
import { captureVideoFrame, fileToSnap, syntheticSnap } from '../media';
import { CameraIcon, FlashIcon, FlipIcon, TimerIcon, UploadIcon } from './icons';

const TIMERS = [1, 3, 5, 7, 10];

interface Props {
  onCapture: (media: string) => void;
  onNotify: (text: string) => void;
}

export default function Camera({ onCapture, onNotify }: Props) {
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [filterId, setFilterId] = useState('clean');
  const [timer, setTimer] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [torch, setTorch] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const countdownTimers = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('No camera on this browser — upload a photo instead.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        setTorch(false);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        if (!cancelled) setReady(true);
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : '';
        setError(
          name === 'NotAllowedError' || name === 'SecurityError'
            ? 'Camera access is blocked. Allow it in the address bar, or upload a photo.'
            : 'No camera available here — upload a photo instead.',
        );
      }
    };

    void start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facing]);

  useEffect(
    () => () => {
      countdownTimers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const constraint = { torch: !torch } as unknown as MediaTrackConstraintSet;
      await track.applyConstraints({ advanced: [constraint] });
      setTorch((value) => !value);
    } catch {
      onNotify('This camera has no flash');
    }
  }, [onNotify, torch]);

  const shoot = useCallback(() => {
    if (!ready || !videoRef.current) {
      fileRef.current?.click();
      return;
    }
    if (countdown !== null) return;

    const run = () => {
      const video = videoRef.current;
      if (!video) return;
      const frame = captureVideoFrame(video, filterById(filterId).css, facing === 'user');
      if (frame) onCapture(frame);
      else onNotify('Could not grab that frame');
    };

    if (timer <= 1) {
      run();
      return;
    }

    setCountdown(timer);
    for (let i = 1; i <= timer; i += 1) {
      const id = window.setTimeout(() => {
        const remaining = timer - i;
        setCountdown(remaining > 0 ? remaining : null);
        if (remaining === 0) run();
      }, i * 1000);
      countdownTimers.current.push(id);
    }
  }, [countdown, facing, filterId, onCapture, onNotify, ready, timer]);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const media = await fileToSnap(file, filterById(filterId).css);
      if (media) onCapture(media);
    } catch {
      onNotify('Could not read that photo');
    }
  };

  return (
    <section className="camera-screen">
      <div className="camera-viewport">
        <video
          ref={videoRef}
          className={`camera-feed ${facing === 'user' ? 'is-mirrored' : ''}`}
          style={{ filter: filterById(filterId).css }}
          playsInline
          muted
          autoPlay
        />
        <div className="camera-vignette" />
      </div>

      {!ready && (
        <div className="camera-fallback">
          <div className="fallback-card">
            <span className="self-plus">
              <CameraIcon />
            </span>
            <h2>Camera's off</h2>
            <p>{error ?? 'Starting the camera…'}</p>
            <button type="button" className="primary-btn" onClick={() => fileRef.current?.click()}>
              Upload a photo
            </button>
            <button
              type="button"
              className="ghost-text-btn"
              onClick={() => {
                const demo = syntheticSnap({ kicker: 'TGG SNAP', title: 'DEMO MODE', hue: 190 });
                if (demo) onCapture(demo);
              }}
            >
              Use a demo shot instead
            </button>
            <button type="button" className="ghost-text-btn" onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}>
              Try the other camera
            </button>
          </div>
        </div>
      )}

      <div className="camera-top">
        <div className="brand-chip">
          <span className="brand-dot" />
          TGG SNAP
        </div>
        <div className="camera-top-actions">
          <button
            type="button"
            className={`ghost-btn ${torch ? 'is-on' : ''}`}
            onClick={toggleTorch}
            aria-label="Toggle flash"
          >
            <FlashIcon />
          </button>
        </div>
      </div>

      <div className="timer-row" role="group" aria-label="Snap timer">
        <span className="timer-caption">
          <TimerIcon /> Timer
        </span>
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

      <div className="camera-spacer" />

      <div className="filter-strip" aria-label="Filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`filter-chip ${filterId === filter.id ? 'is-active' : ''}`}
            onClick={() => setFilterId(filter.id)}
          >
            <span className="filter-swatch" style={{ background: filter.swatch }} />
            {filter.name}
          </button>
        ))}
      </div>

      <div className="camera-bottom">
        <button type="button" className="ghost-btn" onClick={() => fileRef.current?.click()} aria-label="Upload a photo">
          <UploadIcon />
        </button>
        <button type="button" className="shutter" onClick={shoot} aria-label="Take a snap">
          <span />
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => setFacing((value) => (value === 'user' ? 'environment' : 'user'))}
          aria-label="Flip camera"
        >
          <FlipIcon />
        </button>
      </div>

      <div className="camera-hint">Tap to snap · it disappears once it's viewed</div>

      {countdown !== null && <div className="countdown">{countdown}</div>}

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} hidden />
    </section>
  );
}
