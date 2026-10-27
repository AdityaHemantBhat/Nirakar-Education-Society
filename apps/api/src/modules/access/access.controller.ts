import { Request, Response, NextFunction } from 'express';
import { AccessService } from './access.service.js';
import { AccessSettingsUpdateSchema, CreatePassOrderSchema } from '@nirakar/shared';

export class AccessController {
  constructor(private service = new AccessService()) {}

  getSettings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.service.getPublicAccessSettings();
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AccessSettingsUpdateSchema.parse(req.body);
      const updated = await this.service.updateSettings(input);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // Payments disabled — Razorpay removed per site requirements
  createOrder = async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Payments disabled' } });
  };

  handleWebhook = async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Payments disabled' } });
  };

  getSupporters = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.service.getSupportersList();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  manualGrant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, amount, notes } = req.body;
      const pass = await this.service.manualGrantPass(userId, amount, notes);
      res.json({ success: true, data: pass });
    } catch (err) {
      next(err);
    }
  };
}
