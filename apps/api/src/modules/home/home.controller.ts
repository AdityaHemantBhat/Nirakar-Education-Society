import { Request, Response, NextFunction } from 'express';
import { HomeService } from './home.service.js';

export class HomeController {
  constructor(private service = new HomeService()) {}

  getHome = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getHomeData();
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
