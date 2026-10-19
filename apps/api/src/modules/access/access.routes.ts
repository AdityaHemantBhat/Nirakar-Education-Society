import { Router } from 'express';
import { AccessController } from './access.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new AccessController();

// Public Access & Pricing Settings
router.get('/settings', controller.getSettings);

// Create Checkout Order (requires user or guest authentication)
router.post('/order', optionalAuthenticate, controller.createOrder);

// Verified Razorpay Webhook (idempotent, HMAC-verified)
router.post('/webhook', controller.handleWebhook);

// Administrative Controls
router.put('/settings', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.updateSettings);
router.get('/supporters', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.getSupporters);
router.post('/manual-grant', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.manualGrant);

export { router as accessRoutes };
