import { Request } from 'express';
import { prisma } from '@nirakar/db';
import { logger } from './logger.js';

/**
 * The record of what happened in the console.
 *
 * Every meaningful change an administrator makes is written here: who did
 * it, what they touched, and from where. The entry is written in the
 * background, because the record must never slow down — or fail — the
 * action it is recording.
 */

/** The kinds of action that are recorded. */
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  PUBLISH: 'PUBLISH',
  WITHDRAW: 'WITHDRAW',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPLOAD: 'UPLOAD',
  EXPORT: 'EXPORT',
  SETTINGS: 'SETTINGS',
  PASSWORD: 'PASSWORD',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/** What the administrator did, in a sentence an auditor can read. */
export interface AuditEntry {
  /** The kind of action, e.g. `UPDATE`. */
  action: AuditAction | string;
  /** The thing that was acted on, e.g. `LibraryVolume`. */
  entity: string;
  /** Its id, when there is one. */
  entityId?: string | null;
  /** A short summary of the change. */
  summary?: string;
  /** Anything else worth keeping. */
  details?: Record<string, unknown>;
  /** The administrator who did it. */
  userId?: string | null;
}

/**
 * Writes an entry to the log.
 *
 * The write is deliberately not awaited by the caller — an audit failure
 * must never turn a successful operation into an error.
 */
export function recordAudit(req: Request, entry: AuditEntry): void {
  const userId = entry.userId ?? req.user?.sub ?? null;

  /* A handler that has written its own, more detailed entry marks the
     request, so that the automatic recorder does not write a second,
     vaguer one on top of it. */
  (req as any).auditRecorded = true;

  void resolveAuditUserId(userId)
    .then((resolvedUserId) => prisma.auditLog.create({
      data: {
        userId: resolvedUserId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        details: { summary: entry.summary ?? null, ...(entry.details ?? {}) },
        ipAddress: req.ip ?? null,
        userAgent: req.headers['user-agent'] ?? null,
      },
    }))
    .catch((err) => {
      logger.warn({ err }, 'Could not write the audit entry');
    });
}

/**
 * Writes an entry with no request behind it — for work that happens in the
 * background, such as a document being rendered.
 */
export function recordSystemAudit(entry: AuditEntry): void {
  void resolveAuditUserId(entry.userId ?? null)
    .then((userId) => prisma.auditLog.create({
      data: {
        userId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        details: { summary: entry.summary ?? null, ...(entry.details ?? {}) },
      },
    }))
    .catch((err) => {
      logger.warn({ err }, 'Could not write the audit entry');
    });
}

async function resolveAuditUserId(userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  return user?.id ?? null;
}
