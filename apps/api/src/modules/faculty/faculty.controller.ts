import { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { FacultyService } from './faculty.service.js';
import { FacultyProfileUpdateSchema } from '@nirakar/shared';
import { config } from '../../config/index.js';
import { broadcastFacultyUpdate, broadcastFacultyReorder } from '../../lib/socket.js';
import { verifyRecaptchaToken } from '../../lib/recaptcha.js';

export class FacultyController {
  constructor(private service = new FacultyService()) {}

  getPublished = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.service.listPublished(req.query.institutionCode as any, req.query.search as string);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.service.getById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Faculty profile not found' });
        return;
      }
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await this.service.getMyProfile(req.user!.sub);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = FacultyProfileUpdateSchema.parse(req.body);
      const updated = await this.service.updateMyProfile(req.user!.sub, input);
      broadcastFacultyUpdate('updated', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  saveDashboardProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = FacultyProfileUpdateSchema.parse(req.body);
      const updated = await this.service.updateMyProfile(req.user!.sub, input);
      broadcastFacultyUpdate('updated', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageBase64 } = req.body;
      if (typeof imageBase64 !== 'string' || imageBase64.length > 7_000_000) {
        res.status(400).json({ error: { message: 'Provide an image smaller than 5 MB.' } });
        return;
      }

      const matches = imageBase64.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i);
      if (!matches) {
        res.status(400).json({ error: { message: 'Use a valid JPEG, PNG, or WebP image.' } });
        return;
      }
      const buffer = Buffer.from(matches[2], 'base64');
      if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
        res.status(400).json({ error: { message: 'Provide an image smaller than 5 MB.' } });
        return;
      }

      const uploadsDir = path.resolve(config.STORAGE_LOCAL_PATH);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const safeName = `faculty-${timestamp}-${Math.random().toString(36).slice(2, 10)}.webp`;
      const filePath = path.join(uploadsDir, safeName);
      await fs.promises.writeFile(filePath, buffer);

      const photoUrl = `/uploads/${safeName}`;
      res.json({ success: true, photoUrl });
    } catch (err) {
      next(err);
    }
  };

  adminListAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.service.adminList();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  adminSetStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const updated = await this.service.adminApproveReject(req.params.id, status);
      broadcastFacultyUpdate('updated', updated);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  // ==================== QUEUE & DEPARTMENTS ENDPOINTS ====================

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await verifyRecaptchaToken(req.body?.captchaToken, 'auth_faculty_register');
      const result = await this.service.registerApplicant(req.body);
      broadcastFacultyUpdate('created', result);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getPending = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.service.getPendingApplicants();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  approveFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id || req.body?.id;
      const result = await this.service.approveApplicant(id);
      broadcastFacultyUpdate('approved', result);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  rejectFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id || req.body?.id;
      const result = await this.service.rejectApplicant(id);
      broadcastFacultyUpdate('updated', result);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  deleteFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id || req.body?.id;
      const result = await this.service.deleteFaculty(id);
      broadcastFacultyUpdate('deleted', { id, result });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getDepartments = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = this.service.getDepartments();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  updateDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { departments } = req.body;
      const list = this.service.saveDepartments(departments || []);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  // ==================== FACULTY REORDERING ====================

  reorderFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { facultyIds } = req.body;
      if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
        res.status(400).json({ success: false, message: 'facultyIds array is required' });
        return;
      }

      const result = await this.service.saveFacultyOrder(facultyIds);
      broadcastFacultyReorder(facultyIds);
      res.json({ success: true, data: result, message: 'Faculty order updated' });
    } catch (err) {
      next(err);
    }
  };

  getFacultyOrder = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.service.getFacultyOrder();
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  };
}

