import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { MagazineService } from './magazine.service.js';
import { MagazineIssueCreateSchema, MagazineIssueUpdateSchema, MagazineReviewSchema, MagazineSearchQuerySchema } from '@nirakar/shared';
import { AppError } from '../../middleware/error.js';
import { verifyRecaptchaToken } from '../../lib/recaptcha.js';
import { broadcastMagazineReviewUpdate } from '../../lib/socket.js';
import { config } from '../../config/index.js';

function guestKeyFromRequest(req: Request, res: Response): string {
  const fromCookie = req.cookies?.nirakar_device_id;
  if (typeof fromCookie === 'string' && fromCookie.length > 0) return fromCookie;
  const fromHeader = req.headers['x-device-id'];
  if (typeof fromHeader === 'string' && fromHeader.length > 0) return fromHeader;

  const minted = randomUUID();
  res.cookie('nirakar_device_id', minted, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
     sameSite: config.COOKIE_SAME_SITE,
  });
  return minted;
}

export class MagazineController {
  constructor(private service = new MagazineService()) {}

  getReaderReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub ?? null;
      const guestKey = userId ? null : guestKeyFromRequest(req, res);
      const data = await this.service.getReaderReview(req.params.date, userId, guestKey);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  submitReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = MagazineReviewSchema.parse(req.body);
      await verifyRecaptchaToken(body.captchaToken, 'magazine_review');
      const userId = req.user?.sub ?? null;
      const guestKey = userId ? null : guestKeyFromRequest(req, res);
      const data = await this.service.submitReview(
        req.params.date,
        body.rating,
        body.comment,
        userId,
        guestKey,
        body.guestName,
      );
      broadcastMagazineReviewUpdate(data.issueId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      const issues = await this.service.getCalendar(year, month);
      res.json({ success: true, data: issues });
    } catch (err) {
      next(err);
    }
  };

  getIssueByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = req.params.date;
      const issue = await this.service.getIssueByDate(date);

      res.json({ success: true, data: issue });
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = MagazineSearchQuerySchema.parse(req.query);
      const results = await this.service.searchInside(query.q, query.issueId);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  };

  adminUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('BAD_REQUEST', 'PDF document is required', 400);
      }

      const input = MagazineIssueCreateSchema.parse({
        title: req.body.title,
        publishDate: req.body.publishDate,
      });

      const issue = await this.service.uploadAndCreateIssue({
        title: input.title,
        publishDate: input.publishDate,
        pdfPath: req.file.path,
      });

      req.file = undefined;
      res.status(202).json({ success: true, data: issue });
    } catch (err) {
      if (req.file?.path) {
        await fs.rm(req.file.path, { force: true }).catch(() => undefined);
      }
      next(err);
    }
  };

  adminGetIssues = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const issues = await this.service.getAdminIssues();
      res.json({ success: true, data: issues });
    } catch (err) {
      next(err);
    }
  };

  adminGetIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const issue = await this.service.getAdminIssue(req.params.id);
      res.json({ success: true, data: issue });
    } catch (err) {
      next(err);
    }
  };

  adminDeleteIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteIssue(req.params.id);
      res.json({ success: true, data: { deleted: true } });
    } catch (err) {
      next(err);
    }
  };

  adminUpdateIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = MagazineIssueUpdateSchema.parse(req.body);
      const updated = await this.service.updateAdminIssue(req.params.id, input);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };
}
