import { Router } from 'express';
import multer from 'multer';
import { ContentController } from './content.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { contactLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new ContentController();

const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/heic',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|avif|heic|gif|pdf|mp4|webm|mov)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type: Accepted formats are Images (JPEG, PNG, WebP, AVIF), Documents (PDF), and Videos (MP4, WebM)'));
    }
  },
});

// Public Content Routes
router.get('/institutions', controller.getInstitutions);
router.get('/institutions/:slug', controller.getInstitutionBySlug);
router.get('/notices', controller.getNotices);
router.get('/notices/:id', controller.getNoticeById);
router.get('/events', controller.getEvents);
router.get('/events/:id', controller.getEventById);
router.get('/activities', controller.getActivities);
router.get('/galleries', controller.getGalleries);
router.get('/batch-photos/:school', controller.getBatchPhotos);
router.get('/blogs', controller.getBlogs);
router.get('/comments', controller.getComments);
router.post('/comments', controller.createComment);
router.post('/contact', contactLimiter, controller.submitContact);
router.get('/pages/:slug', controller.getPage);
router.get('/stats', controller.getStats);

// Administrative Content Management
router.post('/notices', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createNotice);
router.put('/notices/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateNotice);
router.delete('/notices/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.deleteNotice);

router.post('/events', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createEvent);
router.put('/events/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateEvent);
router.delete('/events/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.deleteEvent);

router.post('/blogs', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createBlog);
router.put('/pages', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.savePage);

// Media Upload & Library
router.post(
  '/media/upload',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'FACULTY', 'ALUMNI'),
  uploadFile.single('file'),
  controller.uploadMedia
);
router.get('/media', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.listMedia);

export { router as contentRoutes };
