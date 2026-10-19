import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new AuthController();

// Alumni/Reader Login
router.post('/login', authLimiter, controller.loginAlumni);

// Admin Portal Login (SUPER_ADMIN, ADMIN, EDITOR)
router.post('/admin/login', authLimiter, controller.loginAdmin);

// Faculty Portal Login (FACULTY)
router.post('/faculty/login', authLimiter, controller.loginFaculty);

// Alumni Registration
router.post('/register', authLimiter, controller.registerAlumni);

// Token Rotation
router.post('/refresh', controller.refreshToken);

// Logout
router.post('/logout', controller.logout);

// Current User Details
router.get('/me', authenticate, controller.me);

export { router as authRoutes };
