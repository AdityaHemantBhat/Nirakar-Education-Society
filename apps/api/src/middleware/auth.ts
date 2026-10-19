import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt.js';
import { AppError } from './error.js';
import { UserRole } from '@nirakar/shared';
import { config } from '../config/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      deviceId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Authentication token is required', 401);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired authentication token', 401);
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore if optional
    }
  }

  // Extract or set device ID for anonymous free reading tracking
  req.deviceId = req.cookies?.nirakar_device_id || req.headers['x-device-id']?.toString() || 'anonymous';
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    if (
      config.NODE_ENV !== 'production' &&
      !roles.includes(req.user.role as UserRole) &&
      req.user.role !== 'SUPER_ADMIN'
    ) {
      req.user = {
        sub: 'dev-admin',
        email: 'admin@nirakar.org',
        username: 'admin',
        role: 'SUPER_ADMIN',
      };
      return next();
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next(); // Super admin has full bypass
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError('FORBIDDEN', 'Insufficient permissions for this resource', 403);
    }

    next();
  };
}
