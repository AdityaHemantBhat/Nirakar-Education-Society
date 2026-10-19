import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AdmissionsController } from './admissions.controller.js';

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

// 3. Official Application PDF Download (Accessible with Application ID / Ref)
router.get('/applications/:id/pdf', controller.downloadPdf);

// 4. Single Application View
router.get('/applications/:id', controller.getApplication);

// 5. Admin Routes (Management, Status, CSV Export, Dynamic Config)
router.get('/admin/applications', controller.listApplications);
router.put('/admin/applications/:id', controller.updateStatus);
router.put('/admin/config', controller.updateConfig);
router.get('/admin/export', controller.exportCsv);

export { router as admissionsRoutes };
