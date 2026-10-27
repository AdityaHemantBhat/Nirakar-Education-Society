import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { prisma } from '@nirakar/db';
import { LibraryService } from './library.service.js';
import {
  LibraryCatalogQuerySchema,
  LibraryReviewSchema,
  LibraryVolumeCreateSchema,
  LibraryVolumeUpdateSchema,
} from '@nirakar/shared';
import { AppError } from '../../middleware/error.js';
import { verifyRecaptchaToken } from '../../lib/recaptcha.js';
import { recordAudit, AUDIT_ACTIONS } from '../../lib/audit.js';
import { broadcastLibraryReviewUpdate } from '../../lib/socket.js';
import { config } from '../../config/index.js';

/**
 * A stable identifier for a reader who is not signed in.
 *
 * It comes from a cookie the site sets for every visitor, so a guest can
 * leave one review per volume without an account. When there is no cookie
 * yet — a first-time visitor — one is minted and returned to the browser,
 * so the next review from the same device is recognised as the same
 * person's.
 */
function guestKeyFromRequest(req: Request, res: Response): string {
  const fromCookie = req.cookies?.nirakar_device_id;
  if (typeof fromCookie === 'string' && /^[a-zA-Z0-9_-]{16,128}$/.test(fromCookie)) return fromCookie;

  const minted = randomUUID();
  res.cookie('nirakar_device_id', minted, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
     sameSite: config.COOKIE_SAME_SITE,
  });
  return minted;
}

export class LibraryController {
  constructor(private service = new LibraryService()) {}

  /* ------------------------------ Public ------------------------------- */

  /** The catalogue: filtered, paginated list of published volumes. */
  getCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = LibraryCatalogQuerySchema.parse(req.query);
      const catalog = await this.service.getCatalog(query);
      res.json({ success: true, data: catalog });
    } catch (err) {
      next(err);
    }
  };

  /** A single volume with all of its rendered pages. */
  getVolume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const volume = await this.service.getVolumeBySlug(req.params.slug);
      res.json({ success: true, data: volume });
    } catch (err) {
      next(err);
    }
  };

  /* ------------------------------ Reviews ------------------------------ */

  /** The reader's own review for a volume, so the form can pre-fill. */
  getUserReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;
      const guestKey = guestKeyFromRequest(req, res);

      const data = userId
        ? await this.service.getUserReview(req.params.id, userId)
        : await this.service.getGuestReview(req.params.id, guestKey);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Records or updates a review of a volume.
   *
   * Anyone may review — an account is not required. The reCAPTCHA token is
   * what keeps the endpoint from being flooded with spam.
   */
  submitReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = LibraryReviewSchema.parse(req.body);

      /* The token is checked before anything is written. */
      await verifyRecaptchaToken(body.captchaToken, 'library_review');

      const userId = req.user?.sub ?? null;
      const guestKey = guestKeyFromRequest(req, res);

      const data = await this.service.submitReview(
        req.params.id,
        body.rating,
        body.comment,
        userId,
        userId ? null : guestKey,
        body.guestName,
      );

      broadcastLibraryReviewUpdate(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /* ------------------------------- Admin ------------------------------- */

  adminUpload = async (req: Request, res: Response, next: NextFunction) => {
    /* Multer writes the file to disk before this handler runs, so if
       anything below goes wrong the file has to be taken back off the
       disk — otherwise a rejected upload leaves a PDF behind that
       nothing records and nothing ever cleans up. */
    try {
      if (!req.file) {
        throw new AppError('BAD_REQUEST', 'A PDF document is required', 400);
      }

      const input = LibraryVolumeCreateSchema.parse(req.body);

      const volume = await this.service.uploadVolume({
        ...input,
        pdfPath: req.file.path,
        originalName: req.file.originalname,
        fileSizeBytes: req.file.size,
      });

      recordAudit(req, {
        action: AUDIT_ACTIONS.UPLOAD,
        entity: 'LibraryVolume',
        entityId: volume.id,
        summary: `The volume “${volume.title}” was uploaded and is being rendered.`,
        details: { title: volume.title, standard: volume.standard, fileSizeBytes: req.file.size },
      });

      res.status(201).json({ success: true, data: volume });
    } catch (err) {
      await this.discardUploadedFile(req);
      next(err);
    }
  };

  /**
   * Removes a file that was written to disk but never became a volume.
   *
   * The upload is only kept when the volume was actually recorded, so a
   * failed validation, a failed insert or a failed dispatch all leave the
   * disk as they found it.
   */
  private async discardUploadedFile(req: Request): Promise<void> {
    if (!req.file?.path) return;

    const stillRecorded = await prisma.libraryVolume
      .findFirst({ where: { pdfPath: req.file.path }, select: { id: true } })
      .catch(() => null);

    if (stillRecorded) return;

    await fs.rm(req.file.path, { force: true }).catch(() => undefined);
  }

  adminList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = LibraryCatalogQuerySchema.parse(req.query);
      const list = await this.service.listForAdmin(query);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  adminGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const volume = await this.service.getForAdmin(req.params.id);
      res.json({ success: true, data: volume });
    } catch (err) {
      next(err);
    }
  };

  adminUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = LibraryVolumeUpdateSchema.parse(req.body);
      const volume = await this.service.updateVolume(req.params.id, input);

      recordAudit(req, {
        action: input.isPublished === true ? AUDIT_ACTIONS.PUBLISH : input.isPublished === false ? AUDIT_ACTIONS.WITHDRAW : AUDIT_ACTIONS.UPDATE,
        entity: 'LibraryVolume',
        entityId: volume.id,
        summary: input.isPublished === true
          ? `The volume “${volume.title}” was published.`
          : input.isPublished === false
            ? `The volume “${volume.title}” was withdrawn from the catalogue.`
            : `The volume “${volume.title}” was edited.`,
        details: { changes: input },
      });

      res.json({ success: true, data: volume });
    } catch (err) {
      next(err);
    }
  };

  adminDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await this.service.getForAdmin(req.params.id);

      await this.service.deleteVolume(req.params.id);

      recordAudit(req, {
        action: AUDIT_ACTIONS.DELETE,
        entity: 'LibraryVolume',
        entityId: req.params.id,
        summary: `The volume “${existing.title}” was deleted, along with its rendered pages.`,
      });

      res.json({ success: true, data: { deleted: true } });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Renders a volume again from the PDF that was uploaded for it.
   *
   * A volume that failed to render has no pages and cannot be published.
   * The original PDF is still on disk, so the document does not have to
   * be uploaded a second time.
   */
  adminReprocess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const volume = await this.service.reprocessVolume(req.params.id);

      recordAudit(req, {
        action: AUDIT_ACTIONS.UPDATE,
        entity: 'LibraryVolume',
        entityId: volume.id,
        summary: `The volume “${volume.title}” was queued to be rendered again.`,
      });

      res.json({ success: true, data: volume });
    } catch (err) {
      next(err);
    }
  };
}
