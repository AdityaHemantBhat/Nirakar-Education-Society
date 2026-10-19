import { createServer } from 'node:http';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { startWorker, boss } from './jobs/boss.js';
import { initSocketIO } from './lib/socket.js';
// Faculty routes and controllers reloaded - verified

async function main() {
  const app = createApp();
  const httpServer = createServer(app);

  // Initialize Socket.IO server for instant updates
  initSocketIO(httpServer);

  // Start HTTP listener immediately so proxy requests succeed right away
  const server = httpServer.listen(config.PORT, '0.0.0.0', () => {
    logger.info(`Nirakar API server listening on http://localhost:${config.PORT}`);
    logger.info(`Health check available at http://localhost:${config.PORT}/healthz`);
  });

  // Start background queue worker concurrently without blocking HTTP listener
  startWorker().catch((err) => {
    logger.warn({ err }, 'PgBoss background worker startup issue');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Graceful shutdown initiated');
    server.close(async () => {
      logger.info('HTTP server closed');
      if (boss) {
        await boss.stop();
        logger.info('PgBoss queue stopped');
      }
      process.exit(0);
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      logger.error('Graceful shutdown timed out, force terminating');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start API server');
  process.exit(1);
});
// Nirakar API Server reloaded with delete routes


