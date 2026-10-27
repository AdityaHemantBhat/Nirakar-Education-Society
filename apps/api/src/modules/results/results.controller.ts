import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { AcademicResultsService } from './results.service.js';
import { AcademicResultCreateSchema, AcademicResultQuerySchema, AcademicResultUpdateSchema, AcademicResultQueryInput } from '@nirakar/shared';
import { recordAudit, AUDIT_ACTIONS } from '../../lib/audit.js';

export class AcademicResultsController {
  constructor(private service = new AcademicResultsService()) {}

  getResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = AcademicResultQuerySchema.parse(req.query);
      const data = await this.service.getResults(query);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  downloadResultsPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: AcademicResultQueryInput = {
        standard: req.query.standard as string | undefined,
        academicYear: req.query.academicYear as string | undefined,
        institutionCode: req.query.institutionCode as string | undefined,
        stream: req.query.stream as string | undefined,
        search: req.query.search as string | undefined,
        featured: req.query.featured as string | undefined,
        page: 1,
        limit: 1000, // Fetch up to 1000 records for the PDF report
      };

      const data = await this.service.getResults(query);
      const items = data.items;

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const filename = `Nirakar_Academic_Results_Std_${query.standard || 'All'}_${query.academicYear || '2025-2026'}.pdf`.replace(/[\s\/]/g, '_');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);

      // Header Banner
      doc.fillColor('#0b132b').rect(0, 0, doc.page.width, 100).fill();
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('SHREE NIRAKAR EDUCATION SOCIETY', 40, 25, { align: 'center' });
      doc.fontSize(12).font('Helvetica').fillColor('#fbbf24').text(`Official Academic Merit List & Results Report (Std ${query.standard || 'All'} — ${query.academicYear || '2025–2026'})`, 40, 55, { align: 'center' });

      doc.moveDown(3);

      // Summary
      doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold').text(`Total Students Listed: ${items.length}`, 40, 115);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, doc.page.width - 200, 115, { align: 'right' });

      doc.moveTo(40, 135).lineTo(doc.page.width - 40, 135).strokeColor('#cccccc').lineWidth(1).stroke();

      let y = 150;

      // Table Header
      doc.fillColor('#0b132b').rect(40, y, doc.page.width - 80, 22).fill();
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      doc.text('Roll No.', 48, y + 6, { width: 60 });
      doc.text('Student Name', 115, y + 6, { width: 180 });
      doc.text('Exam Type', 300, y + 6, { width: 100 });
      doc.text('Score / Grade', 410, y + 6, { width: 80 });
      doc.text('Remarks', 490, y + 6, { width: 70 });

      y += 28;

      doc.font('Helvetica').fontSize(8).fillColor('#333333');

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 40;
        }

        if (i % 2 === 1) {
          doc.fillColor('#f9f9f9').rect(40, y - 4, doc.page.width - 80, 18).fill();
          doc.fillColor('#333333');
        }

        const scoreText = item.percentage !== null && item.percentage !== undefined
          ? `${item.percentage}%`
          : item.cgpa !== null && item.cgpa !== undefined
          ? `${item.cgpa} CGPA`
          : item.grade || '—';

        doc.text(item.rollNumber || '—', 48, y, { width: 60, lineBreak: false });
        doc.text(item.studentName || item.title || '—', 115, y, { width: 180, lineBreak: false });
        doc.text(item.examType, 300, y, { width: 100, lineBreak: false });
        doc.text(scoreText, 410, y, { width: 80, lineBreak: false });
        doc.text(item.remarks || '—', 490, y, { width: 70, lineBreak: false });

        y += 18;
      }

      doc.end();
    } catch (err) {
      next(err);
    }
  };

  getResultById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getResultById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  createResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AcademicResultCreateSchema.parse(req.body);
      const data = await this.service.createResult(input);
      recordAudit(req, {
        action: AUDIT_ACTIONS.CREATE,
        entity: 'AcademicResult',
        entityId: data.id,
        summary: `Created academic result for ${data.studentName || data.title || 'student'}`,
        details: { studentName: data.studentName, standard: data.standard },
      });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  updateResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AcademicResultUpdateSchema.parse(req.body);
      const data = await this.service.updateResult(req.params.id, input);
      recordAudit(req, {
        action: AUDIT_ACTIONS.UPDATE,
        entity: 'AcademicResult',
        entityId: data.id,
        summary: `Updated academic result for ${data.studentName || data.title || 'student'}`,
        details: { studentName: data.studentName },
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  deleteResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.deleteResult(req.params.id);
      recordAudit(req, {
        action: AUDIT_ACTIONS.DELETE,
        entity: 'AcademicResult',
        entityId: req.params.id,
        summary: `Deleted academic result #${req.params.id}`,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
