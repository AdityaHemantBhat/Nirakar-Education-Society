import { Request, Response } from 'express';
import { AdmissionPopupService } from './admissions.popup.service.js';
import { upsertAdmissionPopupSchema } from './admissions.popup.validator.js';

export class AdmissionPopupController {
  constructor(private service = new AdmissionPopupService()) {}

  getPopup = async (_req: Request, res: Response) => {
    try {
      const popup = await this.service.getPopup();
      return res.json({ success: true, data: popup });
    } catch (err: any) {
      console.error('[AdmissionPopupController.getPopup]', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve homepage popup' });
    }
  };

  upsertPopup = async (req: Request, res: Response) => {
    try {
      const parsed = upsertAdmissionPopupSchema.parse(req.body);
      const updated = await this.service.upsertPopup(parsed);
      return res.json({ success: true, data: updated, message: 'Homepage popup updated successfully' });
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, error: err.message || 'Failed to update homepage popup' });
    }
  };
}
