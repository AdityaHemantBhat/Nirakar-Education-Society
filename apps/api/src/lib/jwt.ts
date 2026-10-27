import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/index.js';

export interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  institutionCode?: string | null;
  alumniProfileId?: string | null;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: 'nirakar.org',
    audience: 'nirakar-api',
    algorithm: 'HS256',
  });
}

/**
 * How long a sign-in session lasts, in hours.
 *
 * An administrator can set this from the console's settings. It is read
 * from the settings table rather than the environment so that it can be
 * changed without a redeploy; when the setting cannot be read the default
 * of seven days is used.
 */
export const DEFAULT_SESSION_HOURS = 24;

export async function sessionLengthHours(): Promise<number> {
  try {
    const { prisma } = await import('@nirakar/db');
    const row = await prisma.siteSetting.findUnique({
      where: { key: 'console.sessionLengthHours' },
      select: { value: true },
    });

    const parsed = Number(row?.value);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 720) return Math.round(parsed);
  } catch {
    /* The settings table is not reachable — fall back to the default. */
  }

  return DEFAULT_SESSION_HOURS;
}

export async function generateRefreshToken(): Promise<{
  token: string;
  hash: string;
  expiresAt: Date;
}> {
  const token = crypto.randomBytes(40).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const hours = await sessionLengthHours();
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  return { token, hash, expiresAt };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET, {
    issuer: 'nirakar.org',
    audience: 'nirakar-api',
    algorithms: ['HS256'],
  }) as TokenPayload;
}
