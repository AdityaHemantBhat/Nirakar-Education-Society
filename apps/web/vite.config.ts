import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../..',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
              return 'vendor-framework';
            }
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'vendor-animation';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('page-flip') || id.includes('react-pageflip')) {
              return 'vendor-pageflip';
            }
          }
        },
      },
    },
  },
  server: {
    port: 5000,
    strictPort: true,
    allowedHosts: [
      'handbags-increases-humanities-asp.trycloudflare.com',
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
        /* The socket client reconnects on its own, so a failed upgrade while
           the API is still booting does not need to be reported as an
           error on every attempt. */
        configure: (proxy) => {
          proxy.on('error', () => {
            /* The API is not accepting connections yet. The client retries. */
          });
        },
      },
    },
  },
});
