import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { MagazineController } from './magazine.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.js';
import { config } from '../../config/index.js';
import { magazineReviewLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new MagazineController();

// Multer storage for uploaded PDF files
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(config.STORAGE_LOCAL_PATH, 'magazines'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `issue-${uniqueSuffix}.pdf`);
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are accepted for Magazine Issues'));
    }
  },
});

// Public Reader Routes
router.get('/calendar', controller.getCalendar);
router.get('/issue/:date/review/me', optionalAuthenticate, controller.getReaderReview);
router.post('/issue/:date/review', magazineReviewLimiter, optionalAuthenticate, controller.submitReview);
router.get('/issue/:date', optionalAuthenticate, controller.getIssueByDate);
router.get('/search', controller.search);

// Admin Management Routes
router.get(
  '/admin/issues',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  controller.adminGetIssues
);
router.post(
  '/admin/upload',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  uploadPdf.single('pdf'),
  controller.adminUpload
);
router.get(
  '/admin/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  controller.adminGetIssue
);
router.put(
  '/admin/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  controller.adminUpdateIssue
);
router.delete(
  '/admin/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  controller.adminDeleteIssue,
);

export { router as magazineRoutes };
