import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { LibraryController } from './library.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.js';
import { libraryReviewLimiter } from '../../middleware/rate-limiter.js';
import { config, PRIVATE_STORAGE_PATH } from '../../config/index.js';

const router = Router();
const controller = new LibraryController();

/**
 * Where the rendered page images live.
 *
 * These are the pictures the reader sees, and they are meant to be public
 * — they are served by the static `/uploads` route.
 */
export const LIBRARY_RENDER_DIR = path.resolve(config.STORAGE_LOCAL_PATH, 'library');

/**
 * Where the source PDFs live.
 *
 * The originals are kept outside the uploads directory, because that
 * directory is served to the public. A volume that has been uploaded as a
 * draft must not be downloadable by anyone who can guess its filename, so
 * the source file is private and only the server reads it.
 */
export const LIBRARY_SOURCE_DIR = path.resolve(PRIVATE_STORAGE_PATH, 'library');

/* Multer's disk storage fails outright if the destination is missing, so the
   directory is created once at module load rather than per upload. */
fs.mkdirSync(LIBRARY_RENDER_DIR, { recursive: true });
fs.mkdirSync(LIBRARY_SOURCE_DIR, { recursive: true });

/**
 * Source PDFs are written straight to disk rather than held in memory —
 * a 100MB buffer per concurrent upload would otherwise sit in the heap
 * until the response is sent.
 */
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, LIBRARY_SOURCE_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `volume-${uniqueSuffix}.pdf`);
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are accepted for library volumes'));
    }
  },
});

/**
 * Who may read the console's library list.
 *
 * An Editor is trusted with the catalogue, so it may look at it and see
 * how each volume is doing.
 */
const READ_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] as const;

/**
 * Who may change the catalogue.
 *
 * Deleting a volume throws away its rendered pages and cannot be undone,
 * so it is kept away from an Editor. Uploading and publishing are the
 * ordinary day-to-day work of running the library, so those are shared.
 */
const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const;

/* ------------------------------ Public ------------------------------ */

router.get('/catalog', controller.getCatalog);
router.get('/volume/:slug', controller.getVolume);

/* ----------------------------- Reviews ------------------------------ */

/*
 * Anyone may review a volume — an account is not required. A guest is
 * identified by a per-device cookie, and the reCAPTCHA token is what keeps
 * the endpoint from being flooded. `optionalAuthenticate` picks up a
 * signed-in reader when there is one, so their review is tied to their
 * account rather than to the device.
 */
router.get('/volume/:id/review/me', optionalAuthenticate, controller.getUserReview);
router.post(
  '/volume/:id/review',
  libraryReviewLimiter,
  optionalAuthenticate,
  controller.submitReview,
);

/* ------------------------------- Admin ------------------------------- */

router.post(
  '/admin/upload',
  authenticate,
  requireRole(...READ_ROLES),
  uploadPdf.single('pdf'),
  controller.adminUpload,
);

router.get(
  '/admin',
  authenticate,
  requireRole(...READ_ROLES),
  controller.adminList,
);

router.get(
  '/admin/:id',
  authenticate,
  requireRole(...READ_ROLES),
  controller.adminGet,
);

router.put(
  '/admin/:id',
  authenticate,
  requireRole(...READ_ROLES),
  controller.adminUpdate,
);

/**
 * Re-runs the renderer for a volume whose first attempt failed.
 *
 * The source PDF is still on disk, so the document does not have to be
 * uploaded again — which matters when the failure was the server's and
 * not the file's.
 */
router.post(
  '/admin/:id/reprocess',
  authenticate,
  requireRole(...WRITE_ROLES),
  controller.adminReprocess,
);

router.delete(
  '/admin/:id',
  authenticate,
  requireRole(...WRITE_ROLES),
  controller.adminDelete,
);

export { router as libraryRoutes };
