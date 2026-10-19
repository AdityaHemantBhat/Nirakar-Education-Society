import { Request, Response, NextFunction } from 'express';
import { ContentService } from './content.service.js';
import {
  BlogCreateSchema,
  CommentCreateSchema,
  ContactMessageSchema,
  NoticeCreateSchema,
  NoticeUpdateSchema,
  EventCreateSchema,
  EventUpdateSchema,
  PageCreateSchema,
} from '@nirakar/shared';
import { AppError } from '../../middleware/error.js';

export class ContentController {
  constructor(private service = new ContentService()) {}

  getInstitutions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getInstitutions();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getInstitutionBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getInstitutionDetails(req.params.slug);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getNotices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getNotices(req.query.institutionCode as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getNoticeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getNotice(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  createNotice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = NoticeCreateSchema.parse(req.body);
      const data = await this.service.createNotice(input);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  updateNotice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = NoticeUpdateSchema.parse(req.body);
      const data = await this.service.updateNotice(req.params.id, input);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  deleteNotice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.deleteNotice(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const upcoming = req.query.upcoming !== undefined ? req.query.upcoming === 'true' : undefined;
      const data = await this.service.getEvents(upcoming, req.query.institutionCode as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getEvent(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = EventCreateSchema.parse(req.body);
      const data = await this.service.createEvent(input);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = EventUpdateSchema.parse(req.body);
      const data = await this.service.updateEvent(req.params.id, input);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.deleteEvent(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getActivities(req.query.institutionCode as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getGalleries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getGalleries(req.query.institutionCode as any);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getBatchPhotos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const school = req.params.school;
      const batchYear = req.query.batchYear ? parseInt(req.query.batchYear as string) : undefined;
      const data = await this.service.getBatchPhotos(school as any, batchYear);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getBlogs = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getBlogs();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  createBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = BlogCreateSchema.parse(req.body);
      const data = await this.service.createBlog(input);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getComments(req.query.targetType as string, req.query.targetId as string);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommentCreateSchema.parse(req.body);
      const data = await this.service.createComment(input);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  submitContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = ContactMessageSchema.parse(req.body);
      const data = await this.service.submitContact(input);
      res.status(201).json({ success: true, message: 'Message received. We will respond shortly.', data });
    } catch (err) {
      next(err);
    }
  };

  getPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getPage(req.params.slug);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  savePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = PageCreateSchema.parse(req.body);
      const data = await this.service.savePage(input);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getStats();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('BAD_REQUEST', 'File is required', 400);
      }
      const data = await this.service.uploadMedia(
        req.file.buffer,
        req.file.originalname,
        req.body.altText,
        req.file.mimetype
      );
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  listMedia = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listMedia();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
