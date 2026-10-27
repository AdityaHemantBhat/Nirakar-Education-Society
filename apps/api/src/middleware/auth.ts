import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt.js';
import { AppError } from './error.js';
import { UserRole } from '@nirakar/shared';
import { prisma } from '@nirakar/db';
import { config } from '../config/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      deviceId?: string;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = getToken(req);
    if (!token) throw new AppError('UNAUTHORIZED', 'Authentication token is required', 401);
    const payload = verifyAccessToken(token);

    if (config.NODE_ENV !== 'test') {
      const currentUser = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { role: true, isSuspended: true, deletedAt: true },
      });
      if (!currentUser || currentUser.deletedAt || currentUser.isSuspended || currentUser.role !== payload.role) {
        throw new AppError('UNAUTHORIZED', 'Authentication session is no longer valid', 401);
      }
    }

    req.user = payload;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('UNAUTHORIZED', 'Invalid or expired authentication token', 401));
  }
}

export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = getToken(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
      if (config.NODE_ENV !== 'test') {
        const currentUser = await prisma.user.findUnique({
          where: { id: req.user.sub },
          select: { role: true, isSuspended: true, deletedAt: true },
        });
        if (!currentUser || currentUser.deletedAt || currentUser.isSuspended || currentUser.role !== req.user.role) {
          delete req.user;
        }
      }
    } catch {
      delete req.user;
    }
  }

  req.deviceId = req.cookies?.nirakar_device_id || 'anonymous';
  next();
}

function getToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim() || undefined;
  return typeof req.cookies?.accessToken === 'string' ? req.cookies.accessToken : undefined;
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
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
