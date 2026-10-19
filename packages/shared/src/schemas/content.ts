import { z } from 'zod';
import { SCHOOLS } from '../constants.js';

export const PageSectionBlockType = z.enum([
  'hero',
  'rich_text',
  'gallery',
  'slider',
  'cards',
  'timeline',
  'pdf_list',
  'faculty_grid',
  'events',
  'social_feed',
  'embed',
  'map',
  'cta',
  'accordion',
]);

export const PageSectionSchema = z.object({
  id: z.string().optional(),
  type: PageSectionBlockType,
  order: z.number().int().default(0),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.record(z.any()), // Validated JSONB block payload
  visible: z.boolean().default(true),
});

export const PageCreateSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(2),
  metaDescription: z.string().max(300).optional(),
  published: z.boolean().default(true),
  sections: z.array(PageSectionSchema).default([]),
});

export const NoticeCreateSchema = z.object({
  title: z.string().min(2),
  content: z.string().optional().nullable(),
  school: z.nativeEnum(SCHOOLS).optional().nullable(),
  institutionCode: z.nativeEnum(SCHOOLS).optional().nullable(),
  date: z.string().min(4),
  pinned: z.boolean().default(false),
  pdfUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const NoticeUpdateSchema = NoticeCreateSchema.partial();
export type NoticeCreateInput = z.infer<typeof NoticeCreateSchema>;
export type NoticeUpdateInput = z.infer<typeof NoticeUpdateSchema>;

export const ActivityCreateSchema = z.object({
  title: z.string().min(2),
  description: z.string(),
  school: z.nativeEnum(SCHOOLS).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().default('General'),
  photos: z.array(z.string()).default([]),
});

export const EventCreateSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  school: z.nativeEnum(SCHOOLS).optional().nullable(),
  institutionCode: z.nativeEnum(SCHOOLS).optional().nullable(),
  startDate: z.string().min(4),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isUpcoming: z.boolean().default(true),
  coverUrl: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const EventUpdateSchema = EventCreateSchema.partial();
export type EventCreateInput = z.infer<typeof EventCreateSchema>;
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>;

export const GalleryAlbumCreateSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  school: z.nativeEnum(SCHOOLS).optional().nullable(),
  category: z.string().default('Campus'),
  coverUrl: z.string().url().optional().nullable(),
});

export const BatchPhotoCreateSchema = z.object({
  school: z.nativeEnum(SCHOOLS),
  batchYear: z.number().int().min(1960).max(new Date().getFullYear()),
  title: z.string().min(2),
  photoUrl: z.string().url(),
  caption: z.string().optional().nullable(),
});

export const BlogCreateSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(20),
  authorName: z.string().min(2),
  authorRole: z.string().default('Alumnus'),
  school: z.nativeEnum(SCHOOLS).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
});

export const CommentCreateSchema = z.object({
  authorName: z.string().min(2, 'Name is required'),
  content: z.string().min(3, 'Comment must be at least 3 characters').max(1000),
  targetType: z.enum(['BLOG', 'POST', 'GENERAL']),
  targetId: z.string().optional().nullable(),
});

export const ContactMessageSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
