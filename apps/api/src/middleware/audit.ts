import { Request, Response, NextFunction } from 'express';
import { recordAudit, AUDIT_ACTIONS } from '../lib/audit.js';

/**
 * Records a change in the activity log.
 *
 * Rather than writing the same four lines into every controller, this
 * watches the response: when a request that changes something comes back
 * with a success, the change is written to the log. The response is
 * finished before the entry is written, so the administrator is never
 * waiting on the log.
 */

/** The HTTP methods that change something. */
const CHANGE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * The kind of action, worked out from the method and the path.
 */
function actionFor(method: string, path: string): string {
  if (method === 'DELETE') return AUDIT_ACTIONS.DELETE;
  if (method === 'POST') {
    if (path.includes('upload')) return AUDIT_ACTIONS.UPLOAD;
    if (path.includes('password')) return AUDIT_ACTIONS.PASSWORD;
    return AUDIT_ACTIONS.CREATE;
  }
  return AUDIT_ACTIONS.UPDATE;
}

/**
 * The kind of thing that was changed, worked out from the path.
 *
 * The full path is used rather than `req.path`, because the router
 * rewrites `req.path` as it dispatches — by the time the response is
 * sent, `/api/v1/access/settings` looks like `/settings`.
 */
function entityFor(path: string): string {
  if (path.includes('/library')) return 'LibraryVolume';
  if (path.includes('/admissions')) return 'Admission';
  if (path.includes('/alumni')) return 'AlumniProfile';
  if (path.includes('/faculty')) return 'Faculty';
  if (path.includes('/magazine') || path.includes('/social')) return 'Magazine';
  if (path.includes('/content')) return 'Content';
  if (path.includes('/access')) return 'AccessSettings';
  if (path.includes('/settings/password')) return 'User';
  if (path.includes('/settings')) return 'ConsoleSettings';

  /* The last meaningful segment of the path, e.g. `batches` in
     `/api/v1/social/batches`. */
  const segment = path.split('/').filter(Boolean).pop();
  return segment ? segment.replace(/^\w/, (c) => c.toUpperCase()) : 'Unknown';
}

/**
 * Writes the entry. The administrator's own identity comes from the
 * session, so the log always says who did it.
 */
export function auditChanges(req: Request, res: Response, next: NextFunction): void {
  if (!CHANGE_METHODS.has(req.method)) return next();

  /* The path as it arrived, before the router rewrites it. */
  const fullPath = req.originalUrl || req.url;

  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    const succeeded = res.statusCode < 400 && body?.success !== false;

    /* A handler that wrote its own entry has already said what happened
       in as much detail as it can, so nothing more is recorded here. */
    if (succeeded && !(req as any).auditRecorded) {
      recordAudit(req, {
        action: actionFor(req.method, fullPath),
        entity: entityFor(fullPath),
        entityId: req.params?.id ?? null,
        summary: `${req.method} ${fullPath}`,
        details: { method: req.method, path: fullPath },
      });
    }

    return originalJson(body);
  };

  next();
}
