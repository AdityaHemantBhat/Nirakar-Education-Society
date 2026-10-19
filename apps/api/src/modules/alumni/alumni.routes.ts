import { Router } from 'express';
import { AlumniController } from './alumni.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.js';
import { directoryLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new AlumniController();

// Public Directory Listing
router.get('/', directoryLimiter, controller.getDirectory);

// Admin-only directory and verification management
router.get('/admin/all', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.getAdminDirectory);
router.patch('/admin/:id/verification', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.setAdminVerification);
router.delete('/admin/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.deleteAdminAlumni);

// Authenticated Alumni Profile Management
router.get('/me', authenticate, controller.getOwnProfile);
router.put('/me', authenticate, controller.updateProfile);
router.post('/vouch', authenticate, controller.vouch);
router.post('/report', authenticate, controller.report);

// Full Profile with Per-Field Visibility Masking
router.get('/:username', optionalAuthenticate, controller.getProfile);

// DPDP Act 2023 Compliance
router.get('/privacy/export', authenticate, controller.exportPersonalData);
router.delete('/privacy/delete-my-data', authenticate, controller.deletePersonalData);

export { router as alumniRoutes };
