import { Router } from 'express';
import { SocialController } from './social.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new SocialController();

// Public Social Feed & Content
router.get('/feed', controller.getFeed);
router.get('/photos', controller.getPhotos);
router.get('/events', controller.getEvents);
router.get('/status', controller.getStatus);

// Administrative Sync Trigger
router.post('/sync', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.triggerSync);

export { router as socialRoutes };
