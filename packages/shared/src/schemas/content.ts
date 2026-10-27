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
  content: z.record(z.string(), z.any()), // Validated JSONB block payload
  visible: z.boolean().default(true),
});

const SafeMediaUrlSchema = z.string().max(2048).refine((value) => {
  if (!value) return true;
  if (value.startsWith('/uploads/')) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Use an HTTPS URL or a local /uploads/ path');

const ProfileListSchema = z.array(z.string().trim().min(1).max(1200)).max(100);

export const InstitutionProfileSchema = z.object({
  commitments: z.string().max(12000).optional().default(''),
  infrastructure: ProfileListSchema.optional().default([]),
  rules: ProfileListSchema.optional().default([]),
  admissions: ProfileListSchema.optional().default([]),
  courses: ProfileListSchema.optional().default([]),
  activities: ProfileListSchema.optional().default([]),
}).strict();

export const InstitutionUpdateSchema = z.object({
  tagline: z.string().trim().min(1).max(300),
  history: z.string().max(20000).nullable().optional(),
  vision: z.string().max(5000).nullable().optional(),
  bannerUrl: SafeMediaUrlSchema.nullable().optional(),
  profile: InstitutionProfileSchema,
}).strict();

export const CommitteeCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).nullable().optional(),
  order: z.number().int().min(0).max(10000).optional().default(0),
}).strict();

export const CommitteeMemberWriteSchema = z.object({
  name: z.string().trim().min(1).max(160),
  designation: z.string().trim().min(1).max(160),
  role: z.string().trim().min(1).max(120).optional().default('Member'),
  photoUrl: SafeMediaUrlSchema.nullable().optional(),
  order: z.number().int().min(0).max(10000).optional().default(0),
}).strict();

export const CommitteeMemberOrderSchema = z.object({
  memberIds: z.array(z.string().min(1)).max(500),
}).strict();

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

/** One photograph in an event's gallery. */
export const EventPhotoSchema = z.object({
  url: z.string().min(1),
  caption: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
});

/** One document attached to an event. */
export const EventDocumentSchema = z.object({
  url: z.string().min(1),
  title: z.string().optional().default('Official Document'),
  size: z.string().optional().nullable(),
});

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
  /* The photographs, the documents and the recording are part of a
     gathering, and the console sends them. Without them here the
     validation would quietly throw them away. */
  photos: z.array(EventPhotoSchema).default([]),
  documents: z.array(EventDocumentSchema).default([]),
  videoUrl: z.string().optional().nullable(),
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

export const BlogCreateSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(20),
  authorName: z.string().min(2),
  authorRole: z.string().default('Alumnus'),
  school: z.nativeEnum(SCHOOLS).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
});

const PublicCommentFields = {
  authorName: z.string().trim().min(2, 'Name is required').max(120),
  content: z.string().trim().min(3, 'Comment must be at least 3 characters').max(1000),
};

export const CommentCreateSchema = z.object({
  ...PublicCommentFields,
  targetType: z.enum(['BLOG', 'POST', 'GENERAL']),
  targetId: z.string().trim().min(1).optional().nullable(),
});

export const EventCommentCreateSchema = z.object({
  ...PublicCommentFields,
  place: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email('Please enter a valid email address').max(254),
  targetType: z.literal('EVENT'),
  targetId: z.string().trim().min(1, 'Event ID is required'),
  captchaToken: z.string().min(1, 'Security check is required').max(4096),
});

export const EventFilterSchema = z.enum(['all', 'today', 'upcoming', 'past']);
export type EventFilter = z.infer<typeof EventFilterSchema>;

export const ContactMessageSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
