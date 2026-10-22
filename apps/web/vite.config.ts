import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/** Where the dev server forwards /api calls: the demo API in apps/api. */
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:4100';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    /*
     * 5180, not Vite's default 5173: other local projects (Apollo) use 5173–5175, and Vite
     * silently moves to the next free port when one is taken. Fail loudly instead.
     */
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
});
