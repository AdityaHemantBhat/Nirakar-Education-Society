import { Request, Response, NextFunction, type Express } from 'express';
import { FacultyMessagesService } from './faculty-messages.service.js';

export class FacultyMessagesController {
  constructor(private service = new FacultyMessagesService()) {}

  unreadCount = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.countUnreadAdminMessages();
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  facultyUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.countUnreadFacultyMessages(req.user!.sub);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  start = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.startConversation(req.body, this.files(req));
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getVisitorConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getVisitorConversation(req.params.id, req.get('X-Conversation-Token'));
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  sendVisitorMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.sendVisitorMessage(
        req.params.id,
        req.get('X-Conversation-Token'),
        req.body,
        this.files(req)
      );
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  markVisitorRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.markRead(
        req.params.id,
        'VISITOR',
        req.get('X-Conversation-Token')
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  listAdminConversations = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listAdminConversations();
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  listFacultyConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listFacultyConversations(req.user!.sub);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getAdminConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAdminConversation(req.params.id);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getFacultyConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getFacultyConversation(req.params.id, req.user!.sub);
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  sendFacultyMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.sendFacultyMessage(
        req.params.id,
        req.user!.sub,
        req.body,
        this.files(req)
      );
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  markFacultyRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.markFacultyRead(req.params.id, req.user!.sub);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  sendAdminMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.sendAdminMessage(req.params.id, req.body, this.files(req));
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  markAdminRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.markRead(req.params.id, 'ADMIN');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  setVisitorModeration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.setVisitorManualBlock(req.params.id, req.user!.sub, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  downloadAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attachment = await this.service.getAttachment(req.params.id, {
        visitorToken: req.get('X-Conversation-Token'),
        userId: req.user?.sub,
        isAdmin: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(req.user?.role || ''),
      });
      res.set({
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': attachment.mimeType,
      });
      res.download(attachment.path, attachment.originalName, (error) => {
        if (error && !res.headersSent) next(error);
      });
    } catch (err) {
      next(err);
    }
  };

  private files(req: Request) {
    return (req.files as Express.Multer.File[] | undefined) || [];
  }
}
