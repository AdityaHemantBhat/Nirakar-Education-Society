import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  envDir: '../..',
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_ADMIN_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/admin/' : '/'),
  server: {
    port: 5001,
    strictPort: true,
    allowedHosts: [
      'disclosure-departments-costa-reporters.trycloudflare.com',
      '.trycloudflare.com',
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && !('headersSent' in res && res.headersSent) && typeof (res as any).writeHead === 'function') {
              (res as any).writeHead(503, { 'Content-Type': 'application/json' });
              (res as any).end(
                JSON.stringify({
                  success: false,
                  error: 'API backend is starting up or temporarily offline',
                })
              );
            }
          });
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', () => {
            /* The API may still be starting; Socket.IO will reconnect. */
          });
        },
      },
    },
  },
});
