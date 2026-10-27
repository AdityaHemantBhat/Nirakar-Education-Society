import { Router } from 'express';
import { FacultyController } from './faculty.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rate-limiter.js';

const router = Router();
const controller = new FacultyController();

// Public Faculty Listing
router.get('/', controller.getPublished);

// Public Registration & Department Listing
router.post('/register', authLimiter, controller.register);
router.get('/departments', controller.getDepartments);

// Faculty self-service
router.get('/me', authenticate, requireRole('FACULTY'), controller.getMyProfile);
router.put('/me', authenticate, requireRole('FACULTY'), controller.updateMyProfile);
router.post('/save', authenticate, requireRole('FACULTY'), controller.saveDashboardProfile);
router.post('/upload-photo', authenticate, requireRole('FACULTY', 'ALUMNI', 'ADMIN', 'SUPER_ADMIN'), controller.uploadPhoto);

// Administrative faculty management
const facultyAdmins = [authenticate, requireRole('SUPER_ADMIN', 'ADMIN')];
router.get('/pending', ...facultyAdmins, controller.getPending);
router.post('/departments', ...facultyAdmins, controller.updateDepartments);
router.post('/admin/approve/:id', ...facultyAdmins, controller.approveFaculty);
router.post('/admin/reject/:id', ...facultyAdmins, controller.rejectFaculty);
router.post('/approve', ...facultyAdmins, controller.approveFaculty);
router.post('/reject', ...facultyAdmins, controller.rejectFaculty);
router.delete('/:id', ...facultyAdmins, controller.deleteFaculty);
router.delete('/admin/:id', ...facultyAdmins, controller.deleteFaculty);

// Admin Faculty Management
router.get('/admin/all', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.adminListAll);
router.patch('/admin/:id/status', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.adminSetStatus);

// Faculty Order & Reordering (Admin)
router.post('/admin/reorder', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.reorderFaculty);
router.get('/admin/order', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.getFacultyOrder);

// Single Faculty Profile Lookup (public or admin preview)
router.get('/:id', controller.getById);

export { router as facultyRoutes };