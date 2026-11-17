# TGG OS

[![CI](https://github.com/tggm803sc/tgg-os/actions/workflows/ci.yml/badge.svg)](https://github.com/tggm803sc/tgg-os/actions/workflows/ci.yml)

Unified front door for the TGG apps. Snap — camera, stories, chats and streaks — runs inside it, and the rest of the suite launches from the app grid.

## Development

Node 20 is what CI runs; `.nvmrc` pins it for nvm/fnm users (`nvm use`).

```bash
npm install
npm run dev      # http://localhost:3002
npm run build    # refreshes APK metadata, then builds to dist/
```

`prebuild` refreshes the studio APK version and size into `src/apk-meta.json`; if the APK can't be fetched it keeps the cached values so the build still succeeds.

CI runs `npm ci`, `npm run typecheck` and `npm run build` on every push.
