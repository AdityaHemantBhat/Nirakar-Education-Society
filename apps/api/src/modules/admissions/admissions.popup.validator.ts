import { z } from 'zod';

export const upsertAdmissionPopupSchema = z.object({
  title: z.string().max(120, 'Title must not exceed 120 characters').optional().nullable(),
  body: z.string().max(500, 'Message must not exceed 500 characters').optional().nullable(),
  mediaUrl: z.string().max(3_000_000, 'Popup image is too large').optional().nullable(),
  mediaType: z.enum(['image', 'video']).optional().nullable(),
  visible: z.boolean().optional(),
  ctaText: z.string().max(60, 'Button text must not exceed 60 characters').optional().nullable(),
  ctaUrl: z.string().max(300, 'Button link is too long').optional().nullable(),
});

export type UpsertAdmissionPopupInput = z.infer<typeof upsertAdmissionPopupSchema>;
