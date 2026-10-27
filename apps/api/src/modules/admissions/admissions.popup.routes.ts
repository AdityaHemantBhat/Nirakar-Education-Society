import { Router } from 'express';
import { AdmissionPopupController } from './admissions.popup.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new AdmissionPopupController();

// 1. Public popup configuration (used by the homepage)
router.get('/popup', controller.getPopup);

// 2. Admin upsert for the homepage popup
const popupAdmins = [authenticate, requireRole('SUPER_ADMIN', 'ADMIN')];
router.put('/admin/popup', ...popupAdmins, controller.upsertPopup);

export { router as admissionPopupRoutes };
