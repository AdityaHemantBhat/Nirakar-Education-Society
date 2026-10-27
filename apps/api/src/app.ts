import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from './config/index.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { auditChanges } from './middleware/audit.js';
import { logger } from './lib/logger.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: config.NODE_ENV === 'production' ? {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
           connectSrc: ["'self'", 'https://www.google.com', ...config.CORS_ORIGIN.split(',').map((origin) => origin.trim())],
          frameSrc: ["'self'", 'https://www.google.com/recaptcha/', 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://www.google.com/maps/'],
        },
      } : false,
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

  const uploadsDir = path.resolve(config.STORAGE_LOCAL_PATH);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads/faculty-messages', (_req: Request, res: Response) => {
    res.sendStatus(404);
  });
  app.use('/uploads/admissions', (_req: Request, res: Response) => {
    res.sendStatus(404);
  });
  app.use(
    '/uploads',
    express.static(uploadsDir, {
      maxAge: config.NODE_ENV === 'production' ? '1y' : '0',
      immutable: config.NODE_ENV === 'production',
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  /* Everything that changes something is written to the activity log.
     It sits before the router so that it can wrap the response; the entry
     itself is written once the handler has run, by which point the
     administrator's identity is known. */
  app.use('/api/v1', auditChanges);

  // Mount Main REST API
  app.use('/api/v1', apiRouter);

  // Single Web Service Production Mode: Serve Frontend Apps
  if (config.NODE_ENV === 'production') {
    const compiledDir = path.dirname(fileURLToPath(import.meta.url));
    const webDistPath = fs.existsSync(path.resolve(process.cwd(), 'apps/web/dist'))
      ? path.resolve(process.cwd(), 'apps/web/dist')
      : path.resolve(compiledDir, '../../web/dist');
    const adminDistPath = fs.existsSync(path.resolve(process.cwd(), 'apps/admin/dist'))
      ? path.resolve(process.cwd(), 'apps/admin/dist')
      : path.resolve(compiledDir, '../../admin/dist');

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
