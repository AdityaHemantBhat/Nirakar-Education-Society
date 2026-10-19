import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../../middleware/error.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.js';
import { FacultyMessagesController } from './faculty-messages.controller.js';
import {
  contactLimiter,
  directoryLimiter,
  facultyMessageLimiter,
} from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new FacultyMessagesController();
const adminAccess = [authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR')];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5, fields: 12, parts: 20 },
});
const messageAttachments: RequestHandler = (req, res, next) => {
  upload.array('attachments', 5)(req, res, (error: unknown) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
        ? 'Each attachment must be 10 MB or smaller'
        : error instanceof multer.MulterError && error.code === 'LIMIT_FILE_COUNT'
          ? 'Attach no more than 5 files per message'
          : error instanceof Error
            ? error.message
            : 'Could not process attachments';
      next(new AppError('VALIDATION_ERROR', message, 400));
      return;
    }
    next();
  });
};

router.post('/', contactLimiter, messageAttachments, controller.start);
router.get('/attachments/:id', optionalAuthenticate, controller.downloadAttachment);
router.get('/admin', ...adminAccess, controller.listAdminConversations);
router.get('/admin/unread-count', ...adminAccess, controller.unreadCount);
router.get('/admin/:id', ...adminAccess, controller.getAdminConversation);
router.patch('/admin/:id/moderation', ...adminAccess, controller.setVisitorModeration);
router.post('/admin/:id/messages', ...adminAccess, messageAttachments, controller.sendAdminMessage);
router.patch('/admin/:id/read', ...adminAccess, controller.markAdminRead);
router.get('/faculty', authenticate, requireRole('FACULTY'), controller.listFacultyConversations);
router.get('/faculty/unread-count', authenticate, requireRole('FACULTY'), controller.facultyUnreadCount);
router.get('/faculty/:id', authenticate, requireRole('FACULTY'), controller.getFacultyConversation);
router.post('/faculty/:id/messages', authenticate, requireRole('FACULTY'), messageAttachments, controller.sendFacultyMessage);
router.patch('/faculty/:id/read', authenticate, requireRole('FACULTY'), controller.markFacultyRead);
router.get('/:id', controller.getVisitorConversation);
router.post('/:id/messages', directoryLimiter, facultyMessageLimiter, messageAttachments, controller.sendVisitorMessage);
router.patch('/:id/read', controller.markVisitorRead);

export { router as facultyMessagesRoutes };
