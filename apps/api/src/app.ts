import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config/index.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { logger } from './lib/logger.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // In development and hybrid static serving
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  const allowedOrigins = config.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || config.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('CORS request blocked by security policy'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Device-Id',
        'X-Razorpay-Signature',
        'X-Conversation-Token',
      ],
    })
  );

  // Compression
  app.use(compression());

  // Cookie Parser
  app.use(cookieParser(config.COOKIE_SECRET));

  // JSON Body Parser with rawBody preservation for Webhook HMAC
  app.use(
    express.json({
      limit: '15mb',
      verify: (req: Request, _res: Response, buf: Buffer) => {
        (req as any).rawBody = buf.toString();
      },
    })
  );

  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Healthcheck endpoint
  app.get('/healthz', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Local Uploads Static File Serving
  const uploadsDir = path.resolve(config.STORAGE_LOCAL_PATH);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads/faculty-messages', (_req: Request, res: Response) => {
    res.sendStatus(404);
  });
  app.use(
    '/uploads',
    express.static(uploadsDir, {
      maxAge: config.NODE_ENV === 'production' ? '1y' : '0',
      immutable: config.NODE_ENV === 'production',
    })
  );

  // Mount Main REST API
  app.use('/api/v1', apiRouter);

  // Single Web Service Production Mode: Serve Frontend Apps
  if (config.NODE_ENV === 'production') {
    const webDistPath = path.resolve('../../apps/web/dist');
    const adminDistPath = path.resolve('../../apps/admin/dist');

    // 1. Serve Admin Portal at /admin
    if (fs.existsSync(adminDistPath)) {
      app.use(
        config.ADMIN_BASE_PATH,
        express.static(adminDistPath, {
          maxAge: '1d',
          index: false,
        })
      );

      app.get(`${config.ADMIN_BASE_PATH}/*`, (_req: Request, res: Response) => {
        res.sendFile(path.join(adminDistPath, 'index.html'));
      });
    }

    // 2. Serve Public Site at /
    if (fs.existsSync(webDistPath)) {
      app.use(
        '/',
        express.static(webDistPath, {
          maxAge: '1d',
          index: false,
        })
      );

      app.get('*', (req: Request, res: Response, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith(config.ADMIN_BASE_PATH)) {
          return next();
        }
        res.sendFile(path.join(webDistPath, 'index.html'));
      });
    }
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
