import { Request, Response, NextFunction } from 'express';
import { MagazineService } from './magazine.service.js';
import { MagazineIssueCreateSchema, MagazineIssueUpdateSchema, MagazineSearchQuerySchema } from '@nirakar/shared';
import { AppError } from '../../middleware/error.js';

export class MagazineController {
  constructor(private service = new MagazineService()) {}

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
      const deviceId = req.deviceId || req.cookies?.nirakar_device_id || 'anonymous';
      const issue = await this.service.getIssueByDate(date, {
        userId: req.user?.sub,
        deviceId,
        role: req.user?.role,
      });

      // Ensure device id cookie is set for visitor tracking
      if (!req.cookies?.nirakar_device_id) {
        res.cookie('nirakar_device_id', deviceId, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'lax',
        });
      }

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
        isLocked: req.body.isLocked === 'true' || req.body.isLocked === true,
      });

      const issue = await this.service.uploadAndCreateIssue({
        title: input.title,
        publishDate: input.publishDate,
        pdfPath: req.file.path,
        isLocked: input.isLocked,
      });

      res.status(202).json({ success: true, data: issue });
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
