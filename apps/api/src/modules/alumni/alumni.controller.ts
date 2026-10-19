import { Request, Response, NextFunction } from 'express';
import { AlumniService } from './alumni.service.js';
import { AlumniProfileUpdateSchema, AlumniReportSchema, AlumniVouchSchema } from '@nirakar/shared';
import { VerificationLevel } from '@nirakar/db';
import { broadcastAlumniUpdate } from '../../lib/socket.js';

export class AlumniController {
  constructor(private service = new AlumniService()) {}

  getAdminDirectory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const profiles = await this.service.listAdminDirectory(search);
      res.json({ success: true, data: profiles });
    } catch (err) {
      next(err);
    }
  };

  setAdminVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allowedLevels: VerificationLevel[] = ['UNVERIFIED', 'VERIFIED', 'TRUSTED'];
      const level = req.body?.verificationLevel;
      if (!allowedLevels.includes(level)) {
        res.status(400).json({
          success: false,
          message: 'verificationLevel must be UNVERIFIED, VERIFIED, or TRUSTED.',
        });
        return;
      }
      const profile = await this.service.setAdminVerification(req.params.id, level);
      broadcastAlumniUpdate('verification_changed', profile);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  deleteAdminAlumni = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedProfile = await this.service.deleteAdminAlumni(req.params.id);
      broadcastAlumniUpdate('deleted', deletedProfile);
      res.json({ success: true, data: deletedProfile });
    } catch (err) {
      next(err);
    }
  };

  getDirectory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { school, batchYear, city, occupation, search, cursor, limit } = req.query;
      const result = await this.service.listDirectory({
        school: school as any,
        batchYear: batchYear ? parseInt(batchYear as string) : undefined,
        city: city as string,
        occupation: occupation as string,
        search: search as string,
        cursor: cursor as string,
        limit: limit ? parseInt(limit as string) : 20,
      });

      res.json({
        success: true,
        data: result.records,
        meta: {
          cursor: result.nextCursor,
          hasNextPage: !!result.nextCursor,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await this.service.getProfile(req.params.username, {
        userId: req.user?.sub,
        role: req.user?.role,
      });
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  getOwnProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user!.role !== 'ALUMNI') {
        res.status(403).json({
          success: false,
          error: {
            code: 'ALUMNI_ACCOUNT_REQUIRED',
            message: 'Sign in with an alumni account to manage an alumni profile.',
          },
        });
        return;
      }
      const profile = await this.service.getOwnProfile(req.user!.sub);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AlumniProfileUpdateSchema.parse(req.body);
      const updated = await this.service.updateOwnProfile(req.user!.sub, input);
      broadcastAlumniUpdate('updated', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  vouch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AlumniVouchSchema.parse(req.body);
      const result = await this.service.vouchForAlumni(req.user!.sub, input.targetProfileId, input.note);
      broadcastAlumniUpdate('verification_changed', { id: input.targetProfileId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  report = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AlumniReportSchema.parse(req.body);
      const result = await this.service.reportProfile(req.user!.sub, input.targetProfileId, input.reason);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  exportPersonalData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.exportData(req.user!.sub);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  deletePersonalData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteData(req.user!.sub);
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('accessToken', { path: '/api/v1/auth' });
      res.clearCookie('accessToken', { path: '/api/v1/auth/admin' });
      res.clearCookie('accessToken', { path: '/api/v1/auth/faculty' });
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
