import { useEffect, useState } from 'react';
import {
  DOCK_APPS,
  STUDIO_APK_BUILD,
  STUDIO_APK_PACKAGE,
  STUDIO_APK_SIZE,
  STUDIO_APK_URL,
  STUDIO_APK_VERSION,
  STUDIO_PAGE_URL,
  SUITE_APPS,
  statusLabel,
} from '../suite';

interface Props {
  onOpenSnap: () => void;
  streak: number;
  snapsSent: number;
  crew: number;
}

export default function Os({ onOpenSnap, streak, snapsSent, crew }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const clock = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <section className="os">
      <header className="os-statusbar">
        <span className="os-brand">
          <span className="brand-dot" />
          TGG OS
        </span>
        <span className="os-clock">{clock}</span>
      </header>

      <div className="os-scroll">
        <div className="os-hero">
          <span className="os-kicker">TGG OS 1.0 · one system</span>
          <h1 className="os-title">
            One system.
            <br />
            Whole industry.
          </h1>
          <p className="os-sub">
            Snap runs inside the OS. Every other TGG app launches from here in a new tab.
          </p>
        </div>

        <div className="os-grid">
          {SUITE_APPS.map((app) => {
            const body = (
              <>
                <span
                  className="os-icon"
                  style={{ background: `linear-gradient(140deg, ${app.tint}, rgba(10,10,14,.92))` }}
                >
                  {app.icon}
                </span>
                <span className="os-app-main">
                  <span className="os-app-name">{app.name}</span>
                  <span className="os-app-blurb">{app.blurb}</span>
                </span>
                <span className={`os-status ${app.status}`}>{statusLabel(app.status)}</span>
              </>
            );

            if (app.status === 'in-os') {
              return (
                <button key={app.name} type="button" className="os-app is-open" onClick={onOpenSnap}>
                  {body}
                </button>
              );
            }

            if (app.status === 'offline' || !app.url) {
              return (
                <div key={app.name} className="os-app is-parked">
                  {body}
                </div>
              );
            }

            return (
              <a key={app.name} className="os-app" href={app.url} target="_blank" rel="noreferrer">
                {body}
              </a>
            );
          })}
        </div>

        <div className="os-stats">
          <div className="os-stat">
            <strong>{streak}</strong>
            <span>Day streak</span>
          </div>
          <div className="os-stat">
            <strong>{snapsSent}</strong>
            <span>Snaps sent</span>
          </div>
          <div className="os-stat">
            <strong>{crew}</strong>
            <span>Crew</span>
          </div>
        </div>

        <div className="section-label">
          <span>Downloads</span>
          <span>Android</span>
        </div>

        <div className="os-download">
          <span className="os-download-icon">📦</span>
          <span className="os-download-main">
            <span className="os-download-name">TGG World Studio</span>
            <span className="os-download-meta">
              Android APK · v{STUDIO_APK_VERSION} · {STUDIO_APK_SIZE}
            </span>
            <span className="os-download-sub" title={`${STUDIO_APK_PACKAGE} · build ${STUDIO_APK_BUILD}`}>
              {STUDIO_APK_PACKAGE} · build {STUDIO_APK_BUILD}
            </span>
          </span>
          <a className="os-download-btn" href={STUDIO_APK_URL} download>
            Get APK
          </a>
        </div>
        <a className="os-download-link" href={STUDIO_PAGE_URL} target="_blank" rel="noreferrer">
          Install notes and requirements ↗
        </a>
      </div>

      <nav className="os-dock" aria-label="TGG OS dock">
        <button type="button" className="os-dock-app is-open" onClick={onOpenSnap} aria-label="Open TGG Snap">
          <span>📸</span>
          <em>Snap</em>
        </button>
        {DOCK_APPS.map((app) => (
          <a
            key={app.name}
            className="os-dock-app"
            href={app.url}
            target="_blank"
            rel="noreferrer"
            aria-label={app.name}
          >
            <span>{app.icon}</span>
            <em>{app.name.replace('TGG ', '')}</em>
          </a>
        ))}
      </nav>
    </section>
  );
}
