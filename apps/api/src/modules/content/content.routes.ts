import { Router } from 'express';
import multer from 'multer';
import { ContentController } from './content.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { contactLimiter, eventCommentLimiter, mediaUploadLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new ContentController();

const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 20, parts: 22 },
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
router.get('/blogs', controller.getBlogs);
router.get('/comments', controller.getComments);
router.post('/comments', eventCommentLimiter, controller.createComment);

// Moderation is deliberately separate from the public comments response: the
// console may see private contact details, while public visitors never do.
router.get('/admin/comments', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.getAdminComments);
router.delete('/admin/comments/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.deleteComment);
router.post('/contact', contactLimiter, controller.submitContact);
router.get('/pages/:slug', controller.getPage);
router.get('/stats', controller.getStats);
router.get('/hero-slides', controller.getHeroSlides);

// Administrative institution profiles and governance
router.get('/admin/institutions', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.getAdminInstitutions);
router.put('/admin/institutions/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateInstitution);
router.post('/admin/institutions/:id/committees', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createCommittee);
router.put('/admin/committees/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateCommittee);
router.delete('/admin/committees/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.deleteCommittee);
router.post('/admin/committees/:committeeId/members', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createCommitteeMember);
router.put('/admin/committee-members/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateCommitteeMember);
router.delete('/admin/committee-members/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.deleteCommitteeMember);
router.put('/admin/committees/:committeeId/member-order', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.reorderCommitteeMembers);

// Administrative Content Management
router.post('/notices', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createNotice);
router.put('/notices/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateNotice);
router.delete('/notices/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.deleteNotice);

router.post('/events', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createEvent);
router.put('/events/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateEvent);
router.delete('/events/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.deleteEvent);

router.post('/galleries', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createGalleryAlbum);
router.put('/galleries/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateGalleryAlbum);
router.delete('/galleries/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.deleteGalleryAlbum);

router.post('/blogs', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createBlog);
router.put('/pages', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.savePage);
router.put('/hero-slides', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.saveHeroSlides);

// Media Upload & Library
router.post(
  '/media/upload',
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  mediaUploadLimiter,
  uploadFile.single('file'),
  controller.uploadMedia
);
router.get('/media', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.listMedia);

export { router as contentRoutes };
