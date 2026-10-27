import { z } from 'zod';

/**
 * The streams a graduating batch can belong to.
 *
 * A batch photograph is filed under one stream, which is what lets the
 * archive sort itself without anyone having to tag a record by hand.
 */
export const BATCH_STREAMS = [
  'SSC',
  'HSSC_SCIENCE',
  'HSSC_COMMERCE',
  'HSSC_ARTS',
  'SPECIAL',
] as const;

export type BatchStream = (typeof BATCH_STREAMS)[number];

export const BatchStreamSchema = z.enum(BATCH_STREAMS);

/** How each stream is written out on the public pages. */
export const BATCH_STREAM_LABELS: Record<BatchStream, string> = {
  SSC: 'SSC Batch (Class X)',
  HSSC_SCIENCE: 'HSSC Science Stream (Class XII)',
  HSSC_COMMERCE: 'HSSC Commerce Stream (Class XII)',
  HSSC_ARTS: 'HSSC Arts Stream (Class XII)',
  SPECIAL: 'Special Jubilee / Vocational Batch',
};

/** The short form used in tight spaces, such as a card's tag. */
export const BATCH_STREAM_SHORT_LABELS: Record<BatchStream, string> = {
  SSC: 'SSC (Class X)',
  HSSC_SCIENCE: 'HSSC Science',
  HSSC_COMMERCE: 'HSSC Commerce',
  HSSC_ARTS: 'HSSC Arts',
  SPECIAL: 'Special Batch',
};

/**
 * The academic session a photograph belongs to.
 *
 * The office writes the session the way it was printed on the photograph —
 * "2022-23", "1995-96" — so it is stored as text rather than worked out
 * from the year, because a photograph does not always agree with the
 * calendar.
 */
export const BatchSessionSchema = z
  .string()
  .trim()
  .min(4, 'Session is required')
  .max(20)
  .regex(
    /^[0-9]{4}\s*[-–/]\s*[0-9]{2,4}$/,
    'Write the session as it appears on the photograph, for example 2022-23',
  );

/** The class the students sat in. */
export const BatchClassLevelSchema = z
  .string()
  .trim()
  .min(1, 'Class level is required')
  .max(40);

/** The section within the class. */
export const BatchDivisionSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .or(z.literal(''));

/** The photograph itself, once it has been through the server. */
export const BatchPhotoUrlSchema = z
  .string()
  .trim()
  .min(1, 'A photograph is required')
  .max(600);

/** The year the batch passed out. */
export const BatchYearSchema = z
  .number()
  .int()
  .min(1960, 'The archive does not go back that far')
  .max(2035, 'That year is too far ahead');

/** A photograph being posted to the archive. */
export const BatchPhotoCreateSchema = z.object({
  institutionCode: z.enum(['NIRAKAR_HS', 'TUDAL_HS', 'ANGLE_HSS']),
  batchYear: BatchYearSchema,
  stream: BatchStreamSchema.default('SSC'),
  batchSession: BatchSessionSchema,
  classLevel: BatchClassLevelSchema,
  division: BatchDivisionSchema,
  title: z.string().trim().min(2, 'A title is required').max(160),
  caption: z.string().trim().max(600).optional().or(z.literal('')),
  photoUrl: BatchPhotoUrlSchema,
  fileSizeBytes: z.number().int().min(0).default(0),
  imageFormat: z.string().trim().max(20).default('webp'),
});

/** A photograph being amended. */
export const BatchPhotoUpdateSchema = BatchPhotoCreateSchema.partial();

/** How the archive is asked for a set of photographs. */
export const BatchPhotoQuerySchema = z.object({
  institutionCode: z.enum(['NIRAKAR_HS', 'TUDAL_HS', 'ANGLE_HSS']).optional(),
  stream: BatchStreamSchema.optional(),
  batchYear: z.coerce.number().int().optional(),
  decade: z.coerce.number().int().optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(60),
});

/** One photograph, as the archive reads it. */
export interface BatchPhotoRecord {
  id: string;
  institutionCode: string;
  batchYear: number;
  title: string;
  photoUrl: string;
  caption: string | null;
  stream: BatchStream;
  batchSession: string | null;
  classLevel: string | null;
  division: string | null;
  fileSizeBytes: number;
  imageFormat: string;
  createdAt: string;
  updatedAt: string;
}

/** A page of photographs, with the totals needed for a pager. */
export interface BatchPhotoListResponse {
  items: BatchPhotoRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
