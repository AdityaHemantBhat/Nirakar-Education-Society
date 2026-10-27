import { z } from 'zod';

export const LIBRARY_STANDARDS = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'] as const;
export const LIBRARY_CATEGORIES = [
  'TEXTBOOK',
  'WORKBOOK',
  'REFERENCE',
  'QUESTION_PAPER',
  'PRACTICE_PAPER',
  'NOTEBOOK',
  'OTHER',
] as const;

export const LibraryStandardSchema = z.enum(LIBRARY_STANDARDS);
export const LibraryCategorySchema = z.enum(LIBRARY_CATEGORIES);

/** Standards are stored as bare numerals ("V".."XII"), not the full label. */
export const LibraryStandardInputSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/^STD\.?\s*/i, ''))
  .pipe(LibraryStandardSchema);

export const LibraryVolumeCreateSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  author: z.string().trim().max(120).optional().or(z.literal('')),
  publisher: z.string().trim().max(120).optional().or(z.literal('')),
  academicYear: z.string().trim().max(20).optional().or(z.literal('')),
  standard: LibraryStandardInputSchema,
  category: LibraryCategorySchema.default('TEXTBOOK'),
  subject: z.string().trim().max(80).optional().or(z.literal('')),
  institutionCode: z.enum(['NIRAKAR_HS', 'TUDAL_HS', 'ANGLE_HSS']).optional().or(z.literal('')),
  language: z.string().trim().max(40).default('English'),
  isPublished: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(false),
});

export const LibraryVolumeUpdateSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  author: z.string().trim().max(120).optional().nullable(),
  publisher: z.string().trim().max(120).optional().nullable(),
  academicYear: z.string().trim().max(20).optional().nullable(),
  standard: LibraryStandardInputSchema.optional(),
  category: LibraryCategorySchema.optional(),
  subject: z.string().trim().max(80).optional().nullable(),
  institutionCode: z.enum(['NIRAKAR_HS', 'TUDAL_HS', 'ANGLE_HSS']).optional().nullable(),
  language: z.string().trim().max(40).optional(),
  /* The status is deliberately not settable here. It is worked out from
     `isPublished` by the service, which is also where the rule that a
     volume must have its pages before it can go live is applied. */
  isPublished: z.boolean().optional(),
});

/**
 * Catalogue query. Every field is optional so the catalogue can be filtered
 * by standard, category, subject and free text independently.
 */
export const LibraryCatalogQuerySchema = z.object({
  standard: LibraryStandardSchema.optional(),
  category: LibraryCategorySchema.optional(),
  subject: z.string().trim().max(80).optional(),
  institutionCode: z.enum(['NIRAKAR_HS', 'TUDAL_HS', 'ANGLE_HSS']).optional(),
  q: z.string().trim().max(120).optional(),
  sort: z.enum(['recent', 'title', 'standard', 'popular']).default('recent'),
  /* The admin listing can be narrowed to live volumes or to drafts. The
     public catalogue never uses this — it only ever shows live volumes. */
  published: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

export type LibraryCatalogQuery = z.infer<typeof LibraryCatalogQuerySchema>;
export type LibraryVolumeCreateInput = z.infer<typeof LibraryVolumeCreateSchema>;
export type LibraryVolumeUpdateInput = z.infer<typeof LibraryVolumeUpdateSchema>;

/**
 * A reader's review of a volume. The rating is a whole number of stars and
 * the comment is optional, so a reader can rate without writing.
 *
 * A reader does not need an account to review: a guest is identified by a
 * device key and a display name. The reCAPTCHA token is what keeps the
 * endpoint from being spammed.
 */
export const LibraryReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().nullable(),
  /* An optional public display name; when omitted, the review is anonymous. */
  guestName: z.string().trim().min(2).max(60).optional().or(z.literal('')),
  /* The reCAPTCHA v3 token, required for every review. */
  captchaToken: z.string().trim().min(1).max(4096),
});

export type LibraryReviewInput = z.infer<typeof LibraryReviewSchema>;
