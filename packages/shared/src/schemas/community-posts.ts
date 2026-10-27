import { z } from 'zod';

export const CommunityPostCreateSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  title: z.string().trim().max(140).optional(),
  mediaIds: z.array(z.string().cuid()).max(4).default([]),
});

export const CommunityPostUpdateSchema = z.object({
  body: z.string().trim().min(1).max(5000).optional(),
  title: z.string().trim().max(140).optional(),
  mediaIds: z.array(z.string().cuid()).max(4).optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required');

export const CommunityPostFeedQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(15),
});

export type CommunityPostCreateInput = z.infer<typeof CommunityPostCreateSchema>;
export type CommunityPostUpdateInput = z.infer<typeof CommunityPostUpdateSchema>;
