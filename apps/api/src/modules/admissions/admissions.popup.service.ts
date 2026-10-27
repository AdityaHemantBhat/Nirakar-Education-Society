import { prisma } from '@nirakar/db';
import { broadcastAdmissionsPopupUpdate } from '../../lib/socket.js';
import type { UpsertAdmissionPopupInput } from './admissions.popup.validator.js';

export class AdmissionPopupService {
  /**
   * Fetch the current homepage popup configuration (singleton with id 'default').
   */
  async getPopup() {
    try {
      const popup = await (prisma as any).admissionPopup.findUnique({
        where: { id: 'default' },
      });

      if (!popup) {
        return await (prisma as any).admissionPopup.create({
          data: {
            id: 'default',
            visible: true,
          },
        });
      }

      return popup;
    } catch (err) {
      console.error('[AdmissionPopupService] getPopup fallback error:', err);
      return {
        id: 'default',
        visible: true,
      };
    }
  }

  /**
   * Admin upserts the homepage popup configuration and broadcasts it live to visitors.
   */
  async upsertPopup(input: UpsertAdmissionPopupInput) {
    const updated = await (prisma as any).admissionPopup.upsert({
      where: { id: 'default' },
      update: {
        title: input.title ?? null,
        body: input.body ?? null,
        mediaUrl: input.mediaUrl ?? null,
        mediaType: input.mediaType ?? null,
        visible: input.visible ?? true,
        ctaText: input.ctaText ?? null,
        ctaUrl: input.ctaUrl ?? null,
      },
      create: {
        id: 'default',
        title: input.title ?? null,
        body: input.body ?? null,
        mediaUrl: input.mediaUrl ?? null,
        mediaType: input.mediaType ?? null,
        visible: input.visible ?? true,
        ctaText: input.ctaText ?? null,
        ctaUrl: input.ctaUrl ?? null,
      },
    });

    // Instantly notify web visitors via Socket.IO
    broadcastAdmissionsPopupUpdate(updated);

    return updated;
  }
}
