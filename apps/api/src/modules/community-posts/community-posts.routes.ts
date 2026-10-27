import { Router } from 'express';
import multer from 'multer';
import { CommunityPostsController } from './community-posts.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error.js';
import { communityPostLimiter, directoryLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new CommunityPostsController();
const requireAlumni = (req: any, _res: any, next: any) => {
  if (req.user?.role !== 'ALUMNI') {
    next(new AppError('FORBIDDEN', 'An alumni account is required.', 403));
    return;
  }
  next();
};
const alumniOnly = [authenticate, requireAlumni];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (valid.includes(file.mimetype)) callback(null, true);
    else callback(new Error('Use JPEG, PNG, WebP, AVIF, GIF, MP4, WebM, or MOV media.'));
  },
});

router.get('/feed', ...alumniOnly, directoryLimiter, controller.feed);
router.post('/', ...alumniOnly, communityPostLimiter, controller.create);
router.put('/:id', ...alumniOnly, communityPostLimiter, controller.update);
router.delete('/:id', ...alumniOnly, communityPostLimiter, controller.delete);
router.post('/media', ...alumniOnly, communityPostLimiter, upload.single('file'), controller.upload);

export { router as communityPostsRoutes };
