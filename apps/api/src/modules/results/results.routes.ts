import { Router } from 'express';
import { AcademicResultsController } from './results.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new AcademicResultsController();

router.get('/', controller.getResults);
router.get('/pdf/download', controller.downloadResultsPdf);
router.get('/:id', controller.getResultById);

router.post('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.createResult);
router.put('/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'), controller.updateResult);
router.delete('/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), controller.deleteResult);

export const academicResultsRoutes = router;
