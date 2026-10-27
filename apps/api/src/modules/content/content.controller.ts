import { Request, Response, NextFunction } from 'express';
import { ContentService } from './content.service.js';
import {
  BlogCreateSchema,
  CommentCreateSchema,
  EventCommentCreateSchema,
  ContactMessageSchema,
  NoticeCreateSchema,
  NoticeUpdateSchema,
  EventCreateSchema,
  EventUpdateSchema,
  EventFilterSchema,
  PageCreateSchema,
  InstitutionUpdateSchema,
  CommitteeCreateSchema,
  CommitteeMemberWriteSchema,
  CommitteeMemberOrderSchema,
} from '@nirakar/shared';
import { AppError } from '../../middleware/error.js';
import { verifyRecaptchaToken } from '../../lib/recaptcha.js';
import { recordAudit, AUDIT_ACTIONS } from '../../lib/audit.js';

export class ContentController {
  constructor(private service = new ContentService()) {}

  getAdminInstitutions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAdminInstitutions();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  updateInstitution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = InstitutionUpdateSchema.parse(req.body);
      const data = await this.service.updateInstitution(req.params.id, input);
      recordAudit(req, { action: AUDIT_ACTIONS.UPDATE, entity: 'Institution', entityId: data.id, summary: `Updated institution profile: ${data.name}`, details: { institutionCode: data.code } });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  createCommittee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommitteeCreateSchema.parse(req.body);
      const data = await this.service.createCommittee(req.params.id, input);
      recordAudit(req, { action: AUDIT_ACTIONS.CREATE, entity: 'Committee', entityId: data.id, summary: `Created committee: ${data.name}`, details: { institutionId: req.params.id } });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  };

  updateCommittee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommitteeCreateSchema.parse(req.body);
      const data = await this.service.updateCommittee(req.params.id, input);
      recordAudit(req, { action: AUDIT_ACTIONS.UPDATE, entity: 'Committee', entityId: data.id, summary: `Updated committee: ${data.name}` });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  deleteCommittee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteCommittee(req.params.id);
      recordAudit(req, { action: AUDIT_ACTIONS.DELETE, entity: 'Committee', entityId: req.params.id, summary: 'Deleted a committee and its roster' });
      res.json({ success: true, data: { id: req.params.id } });
    } catch (err) { next(err); }
  };

  createCommitteeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommitteeMemberWriteSchema.parse(req.body);
      const data = await this.service.createCommitteeMember(req.params.committeeId, input);
      recordAudit(req, { action: AUDIT_ACTIONS.CREATE, entity: 'CommitteeMember', entityId: data.id, summary: `Added committee member: ${data.name}` });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  };

  updateCommitteeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommitteeMemberWriteSchema.parse(req.body);
      const data = await this.service.updateCommitteeMember(req.params.id, input);
      recordAudit(req, { action: AUDIT_ACTIONS.UPDATE, entity: 'CommitteeMember', entityId: data.id, summary: `Updated committee member: ${data.name}` });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  deleteCommitteeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteCommitteeMember(req.params.id);
      recordAudit(req, { action: AUDIT_ACTIONS.DELETE, entity: 'CommitteeMember', entityId: req.params.id, summary: 'Removed a committee member' });
      res.json({ success: true, data: { id: req.params.id } });
    } catch (err) { next(err); }
  };

  reorderCommitteeMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommitteeMemberOrderSchema.parse(req.body);
      const data = await this.service.reorderCommitteeMembers(req.params.committeeId, input.memberIds);
      recordAudit(req, { action: AUDIT_ACTIONS.UPDATE, entity: 'CommitteeMember', entityId: req.params.committeeId, summary: 'Reordered committee members' });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

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
      const requestedFilter = req.query.filter;
      const filter = requestedFilter === undefined
        ? req.query.upcoming === 'true' ? 'upcoming' : req.query.upcoming === 'false' ? 'past' : 'all'
        : EventFilterSchema.parse(requestedFilter);
      const data = await this.service.getEvents(filter, req.query.institutionCode as any);
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

  createGalleryAlbum = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.createGalleryAlbum(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  updateGalleryAlbum = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.updateGalleryAlbum(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  deleteGalleryAlbum = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteGalleryAlbum(req.params.id);
      res.json({ success: true, message: 'Gallery album deleted successfully' });
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

  getAdminComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAdminComments(req.query.targetType as string | undefined);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.deleteComment(req.params.id);
      recordAudit(req, {
        action: AUDIT_ACTIONS.DELETE,
        entity: 'Comment',
        entityId: data.id,
        summary: 'Deleted a public comment',
        details: { targetType: data.targetType, targetId: data.targetId },
      });
      res.json({ success: true, data: { id: data.id } });
    } catch (err) {
      next(err);
    }
  };

  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isEventComment = req.body?.targetType === 'EVENT';
      if (isEventComment) {
        const input = EventCommentCreateSchema.parse(req.body);
        await verifyRecaptchaToken(input.captchaToken, 'event_comment');
        const data = await this.service.createComment(input);
        res.status(201).json({ success: true, data });
        return;
      }

      const comment = CommentCreateSchema.parse(req.body);
      const data = await this.service.createComment(comment);
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

  getHeroSlides = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getHeroSlides();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  saveHeroSlides = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slides = req.body.slides || req.body;
      if (!Array.isArray(slides)) {
        throw new AppError('BAD_REQUEST', 'Slides array is required', 400);
      }
      const data = await this.service.saveHeroSlides(slides);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
