import { z } from 'zod';

export const MagazineArticleSchema = z.object({
  title: z.string().min(1, 'Article title is required'),
  startPage: z.number().int().min(1),
  author: z.string().optional().nullable(),
});

export const MagazineIssueCreateSchema = z.object({
  title: z.string().min(2, 'Issue title is required'),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Publish date must be in YYYY-MM-DD format'),
  excerpt: z.string().max(500).optional(),
});

export const MagazineIssueUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED']).optional(),
  coverUrl: z.string().url().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional(),
  articles: z.array(MagazineArticleSchema).optional(),
});

export const MagazineReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().nullable(),
  guestName: z.string().trim().max(60).optional().or(z.literal('')),
  captchaToken: z.string().trim().min(1).max(4096),
});

export type MagazineReviewInput = z.infer<typeof MagazineReviewSchema>;

export const MagazineSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  issueId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
