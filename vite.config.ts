import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hostnames come from the environment so preview hosts never land in tracked files.
const allowedHosts = (process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3002,
    strictPort: true,
    allowedHosts,
  },
});
