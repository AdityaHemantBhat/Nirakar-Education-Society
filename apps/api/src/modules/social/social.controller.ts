import { Request, Response, NextFunction } from 'express';
import { SocialService } from './social.service.js';

export class SocialController {
  constructor(private service = new SocialService()) {}

  getFeed = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getFeed();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getPhotos = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getPhotos();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const upcoming = req.query.upcoming !== undefined ? req.query.upcoming === 'true' : undefined;
      const data = await this.service.getEvents(upcoming);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getStatus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getStatus();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  triggerSync = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.syncFacebook();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
