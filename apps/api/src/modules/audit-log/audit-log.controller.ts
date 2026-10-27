import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuditLogService } from './audit-log.service.js';
import { AppError } from '../../middleware/error.js';

/**
 * The audit query. Every field is optional so the log can be narrowed by
 * one thing at a time.
 */
const AuditQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  action: z.string().trim().max(60).optional(),
  entity: z.string().trim().max(60).optional(),
  userId: z.string().trim().max(64).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export class AuditLogController {
  constructor(private service = new AuditLogService()) {}

  /** A page of the log. */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = AuditQuerySchema.parse(req.query);
      const data = await this.service.list(query);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /** The kinds of action, entity and author in the log, for the filters. */
  facets = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.facets();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
