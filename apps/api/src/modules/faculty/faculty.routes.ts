import { Router } from 'express';
import { FacultyController } from './faculty.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new FacultyController();

// Public Faculty Listing
router.get('/', controller.getPublished);

// Public Registration & Departments
router.post('/register', authLimiter, controller.register);
router.get('/pending', controller.getPending);
router.get('/departments', controller.getDepartments);
router.post('/departments', controller.updateDepartments);

// Admin Approval & Management Actions
router.post('/admin/approve/:id', controller.approveFaculty);
router.post('/admin/reject/:id', controller.rejectFaculty);
router.post('/approve', controller.approveFaculty);
router.post('/reject', controller.rejectFaculty);
router.delete('/:id', controller.deleteFaculty);
router.delete('/admin/:id', controller.deleteFaculty);

// Faculty Self-Service (FACULTY or SUPER_ADMIN)
router.get('/me', authenticate, requireRole('FACULTY'), controller.getMyProfile);
router.put('/me', authenticate, requireRole('FACULTY'), controller.updateMyProfile);
router.post('/save', controller.saveDashboardProfile);
router.post('/upload-photo', controller.uploadPhoto);

// Admin Faculty Management
router.get('/admin/all', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.adminListAll);
router.patch('/admin/:id/status', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.adminSetStatus);

// Faculty Order & Reordering (Admin)
router.post('/admin/reorder', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.reorderFaculty);
router.get('/admin/order', controller.getFacultyOrder);

// Single Faculty Profile Lookup (public or admin preview)
router.get('/:id', controller.getById);

export { router as facultyRoutes };