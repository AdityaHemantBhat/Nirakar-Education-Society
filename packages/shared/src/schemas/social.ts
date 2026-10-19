import { z } from 'zod';

export const SocialItemSchema = z.object({
  id: z.string().optional(),
  source: z.enum(['FACEBOOK', 'INSTAGRAM']),
  externalId: z.string().min(1),
  type: z.enum(['POST', 'PHOTO', 'EVENT', 'ALBUM']),
  text: z.string().optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
  permalink: z.string().url(),
  publishedAt: z.string(),
  eventStart: z.string().optional().nullable(),
  eventEnd: z.string().optional().nullable(),
  eventPlace: z.string().optional().nullable(),
});

export const SocialSyncStateSchema = z.object({
  source: z.enum(['FACEBOOK', 'INSTAGRAM']),
  lastSyncAt: z.string().optional().nullable(),
  status: z.enum(['IDLE', 'SYNCING', 'SUCCESS', 'ERROR']),
  errorMessage: z.string().optional().nullable(),
  itemsCount: z.number().int().default(0),
});
