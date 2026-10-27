import { Router } from 'express';
import { AuditLogController } from './audit-log.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new AuditLogController();

/* The log records what administrators did, so only administrators may
   read it. */
router.get('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.list);
router.get('/facets', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.facets);

export { router as auditLogRoutes };
