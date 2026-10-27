import path from 'node:path';
import fs from 'node:fs';
import { Request, Response } from 'express';
import { AdmissionsService } from './admissions.service.js';
import {
  submitAdmissionSchema,
  updateAdmissionConfigSchema,
  updateApplicationStatusSchema,
} from './admissions.validator.js';
import { generateAdmissionApplicationPdf } from './admissions.pdf.js';
import { PRIVATE_STORAGE_PATH } from '../../config/index.js';

export class AdmissionsController {
  constructor(private service = new AdmissionsService()) {}

  getConfig = async (_req: Request, res: Response) => {
    try {
      const config = await this.service.getConfig();
      return res.json({ success: true, data: config });
    } catch (err: any) {
      console.error('[AdmissionsController.getConfig]', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve admission configuration' });
    }
  };

  updateConfig = async (req: Request, res: Response) => {
    try {
      const parsed = updateAdmissionConfigSchema.parse(req.body);
      const updated = await this.service.updateConfig(parsed);
      return res.json({ success: true, data: updated, message: 'Admissions settings updated successfully' });
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, error: err.message || 'Failed to update admissions settings' });
    }
  };

  submitApplication = async (req: Request, res: Response) => {
    try {
      const parsed = submitAdmissionSchema.parse(req.body);
       const ip = req.ip || req.socket.remoteAddress || '';
      const application = await this.service.createApplication(parsed, ip);

      return res.status(201).json({
        success: true,
        data: application,
        message: 'Your admission application has been successfully submitted.',
      });
    } catch (err: any) {
      console.error('[AdmissionsController.submitApplication]', err);
      if (err.errors) {
        return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Validation error' });
      }
      return res.status(400).json({ success: false, error: err.message || 'Failed to submit admission application' });
    }
  };

  listApplications = async (req: Request, res: Response) => {
    try {
      const { search, institutionCode, status, academicYear, page, limit } = req.query;
      const result = await this.service.listApplications({
        search: search as string,
        institutionCode: institutionCode as string,
        status: status as string,
        academicYear: academicYear as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('[AdmissionsController.listApplications]', err);
      return res.status(500).json({ success: false, error: 'Failed to list applications' });
    }
  };

  getApplication = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const app = await this.service.getApplicationById(id);
      return res.json({ success: true, data: app });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: err.message || 'Application not found' });
    }
  };

  downloadPdf = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const app = await this.service.getApplicationById(id);

      // Check for saved candidate photo and signature files on disk
      let photoBuffer: Buffer | null = null;
      let signatureBuffer: Buffer | null = null;

       const admissionsUploadsDir = path.resolve(PRIVATE_STORAGE_PATH, 'admissions');
      const photoPath = path.join(admissionsUploadsDir, `${app.id}_photo.jpg`);
      const sigPath = path.join(admissionsUploadsDir, `${app.id}_signature.png`);

      if (fs.existsSync(photoPath)) {
        try {
          photoBuffer = fs.readFileSync(photoPath);
        } catch {}
      }
      if (fs.existsSync(sigPath)) {
        try {
          signatureBuffer = fs.readFileSync(sigPath);
        } catch {}
      }

      const pdfBuffer = await generateAdmissionApplicationPdf(app, photoBuffer, signatureBuffer);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="Admission_${app.applicationNumber}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    } catch (err: any) {
      console.error('[AdmissionsController.downloadPdf]', err);
      return res.status(404).json({ success: false, error: 'Failed to generate application PDF' });
    }
  };

  downloadMedia = async (req: Request, res: Response) => {
    try {
      const media = await this.service.getApplicationMedia(req.params.id, req.params.kind);
      res.set({
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': media.mimeType,
        'Content-Disposition': `inline; filename="${media.filename}"`,
      });
      return res.sendFile(media.path);
    } catch {
      return res.status(404).json({ success: false, error: 'Application media not found' });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, adminRemarks } = updateApplicationStatusSchema.parse(req.body);
      const updated = await this.service.updateApplicationStatus(id, status, adminRemarks);

      return res.json({ success: true, data: updated, message: 'Application status updated successfully' });
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, error: err.message || 'Failed to update status' });
    }
  };

  exportCsv = async (req: Request, res: Response) => {
    try {
      const academicYear = req.query.academicYear as string | undefined;
      const csv = await this.service.exportCsv(academicYear);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Nirakar_Admissions_${academicYear || 'All'}.csv"`
      );
      return res.send(csv);
    } catch (err: any) {
      console.error('[AdmissionsController.exportCsv]', err);
      return res.status(500).json({ success: false, error: 'Failed to export CSV' });
    }
  };
}
