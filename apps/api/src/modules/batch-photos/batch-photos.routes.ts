import { Router } from 'express';
import multer from 'multer';
import { BatchPhotosController } from './batch-photos.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();
const controller = new BatchPhotosController();

/**
 * The photograph is held in memory rather than written straight to disk,
 * because it has to be converted to WebP before it is saved, and the
 * conversion reads the whole file anyway.
 */
const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are accepted for batch photographs'));
    }
  },
});

/**
 * Who may change the archive.
 *
 * A batch photograph is a record of a graduating class, so it is kept away
 * from an Editor. Reading the archive is ordinary work for the office, so
 * that is open to all three.
 */
const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] as const;
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

/* ------------------------------ Public ------------------------------ */

router.get('/', controller.listPublic);
router.get('/stats', controller.stats);
router.get('/:id/download', controller.download);

/* ------------------------------- Admin ------------------------------- */

router.post(
  '/admin/upload',
  authenticate,
  requireRole(...WRITE_ROLES),
  uploadPhoto.single('photo'),
  controller.upload,
);

router.post(
  '/admin',
  authenticate,
  requireRole(...WRITE_ROLES),
  controller.create,
);

router.put(
  '/admin/:id',
  authenticate,
  requireRole(...WRITE_ROLES),
  controller.update,
);

router.delete(
  '/admin/:id',
  authenticate,
  requireRole(...WRITE_ROLES),
  controller.remove,
);

export { router as batchPhotosRoutes };
