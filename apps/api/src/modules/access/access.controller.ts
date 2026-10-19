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

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CreatePassOrderSchema.parse(req.body);
      const order = await this.service.createRazorpayOrder(input.amount, req.user?.sub);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };

  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || '';
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const result = await this.service.handleRazorpayWebhook(rawBody, signature);
      res.json(result);
    } catch (err) {
      next(err);
    }
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
