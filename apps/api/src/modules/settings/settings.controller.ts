import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service.js';
import { AppError } from '../../middleware/error.js';
import { ChangePasswordSchema, ConsoleSettingsSchema } from '@nirakar/shared';
import { recordAudit, AUDIT_ACTIONS } from '../../lib/audit.js';

export class SettingsController {
  constructor(private service = new SettingsService()) {}

  /**
   * Where the sign-in page lives.
   *
   * This is public, because the console has to know where to send an
   * administrator who is not signed in — and it has to know before anyone
   * has signed in.
   */
  getLoginPath = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const path = await this.service.getAdminLoginPath();
      res.json({ success: true, data: { path } });
    } catch (err) {
      next(err);
    }
  };

  /** The console's settings. */
  getConsoleSettings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getConsoleSettings();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /** Changes the console's settings. */
  updateConsoleSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = ConsoleSettingsSchema.partial().parse(req.body);
      const data = await this.service.updateConsoleSettings(input);

      recordAudit(req, {
        action: AUDIT_ACTIONS.SETTINGS,
        entity: 'ConsoleSettings',
        summary: 'The console settings were changed.',
        details: { settings: data },
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /** Changes the signed-in administrator's own password. */
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;
      if (!userId) throw new AppError('UNAUTHORIZED', 'Authentication is required', 401);

      const input = ChangePasswordSchema.parse(req.body);
      await this.service.changePassword(userId, input);

      recordAudit(req, {
        action: AUDIT_ACTIONS.PASSWORD,
        entity: 'User',
        entityId: userId,
        summary: 'The account password was changed.',
      });

      res.json({ success: true, data: { changed: true } });
    } catch (err) {
      next(err);
    }
  };

  /** Lists administrative users */
  listAdminUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.listAdminUsers();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /** Super admin creates a new Admin or Editor */
  createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const operatorRole = req.user?.role || '';
      const input = req.body;
      const data = await this.service.createAdminUser(operatorRole, input);

      recordAudit(req, {
        action: AUDIT_ACTIONS.CREATE,
        entity: 'User',
        entityId: data.id,
        summary: `Created new ${data.role} account: ${data.username}`,
        details: { username: data.username, email: data.email, role: data.role },
      });

      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /** Reset password of an admin or editor */
  resetAdminUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const operatorId = req.user?.sub || '';
      const operatorRole = req.user?.role || '';
      const targetUserId = req.params.id;
      const { newPassword } = req.body;

      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 10) {
        throw new AppError('BAD_REQUEST', 'Password must be at least 10 characters long', 400);
      }

      const result = await this.service.resetAdminUserPassword(
        operatorId,
        operatorRole,
        targetUserId,
        newPassword,
      );

      recordAudit(req, {
        action: AUDIT_ACTIONS.PASSWORD,
        entity: 'User',
        entityId: targetUserId,
        summary: `Reset password for administrator: ${result.username}`,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  /** Delete an admin or editor account (Super Admin only, Super Admin cannot be deleted) */
  deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const operatorRole = req.user?.role || '';
      const targetUserId = req.params.id;

      const result = await this.service.deleteAdminUser(operatorRole, targetUserId);

      recordAudit(req, {
        action: AUDIT_ACTIONS.DELETE,
        entity: 'User',
        entityId: targetUserId,
        summary: `Deleted administrator account: ${result.username}`,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
