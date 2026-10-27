import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AdmissionsController } from './admissions.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new AdmissionsController();

// Rate limiter for public application submissions to prevent spam bot attacks
const applicationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 submissions per window
  message: {
    success: false,
    error: 'Too many admission applications submitted from this network. Please wait a few minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 1. Public Configuration & Status Route (Used by Hero dynamic button & form)
router.get('/config', controller.getConfig);

// 2. Public Student Online Application Submission
router.post('/apply', applicationRateLimiter, controller.submitApplication);

// Application details and documents contain personal information; restrict them to admissions administrators.
router.get('/applications/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.getApplication);
router.get('/applications/:id/media/:kind', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.downloadMedia);
router.get('/applications/:id/pdf', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), applicationRateLimiter, controller.downloadPdf);

// 5. Admin Routes (Management, Status, CSV Export, Dynamic Config)
const admissionsAdmins = [authenticate, requireRole('SUPER_ADMIN', 'ADMIN')];
router.get('/admin/applications', ...admissionsAdmins, controller.listApplications);
router.put('/admin/applications/:id', ...admissionsAdmins, controller.updateStatus);
router.put('/admin/config', ...admissionsAdmins, controller.updateConfig);
router.get('/admin/export', ...admissionsAdmins, controller.exportCsv);

export { router as admissionsRoutes };
