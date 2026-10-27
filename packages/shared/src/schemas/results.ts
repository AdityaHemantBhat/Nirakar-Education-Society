import { z } from 'zod';
import { LIBRARY_STANDARDS } from './library.js';

export const AcademicResultStandardSchema = z.enum(LIBRARY_STANDARDS);

export const AcademicResultCreateSchema = z.object({
  title: z.string().trim().max(200).optional().nullable(),
  academicYear: z.string().trim().min(3, 'Academic year is required').max(30),
  standard: AcademicResultStandardSchema,
  examType: z.string().trim().min(2, 'Exam type is required').max(100),
  stream: z.string().trim().max(50).optional().nullable(),
  institutionCode: z.enum(['NIRAKAR_HS', 'TUDAL_HS', 'ANGLE_HSS']).default('NIRAKAR_HS'),
  pdfUrl: z.string().trim().max(2000).optional().nullable(),
  studentName: z.string().trim().max(200).optional().nullable(),
  rollNumber: z.string().trim().max(50).optional().nullable(),
  percentage: z.number().min(0).max(100).optional().nullable(),
  cgpa: z.number().min(0).max(10).optional().nullable(),
  grade: z.string().trim().max(20).optional().nullable(),
  remarks: z.string().trim().max(500).optional().nullable(),
  photoUrl: z.string().trim().max(2000).optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export const AcademicResultUpdateSchema = AcademicResultCreateSchema.partial();

export const AcademicResultQuerySchema = z.object({
  standard: z.string().optional(),
  academicYear: z.string().optional(),
  institutionCode: z.string().optional(),
  stream: z.string().optional(),
  featured: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Sheet aliases for backwards compatibility
export const AcademicResultSheetCreateSchema = AcademicResultCreateSchema;
export const AcademicResultSheetUpdateSchema = AcademicResultUpdateSchema;

export type AcademicResultCreateInput = z.infer<typeof AcademicResultCreateSchema>;
export type AcademicResultUpdateInput = z.infer<typeof AcademicResultUpdateSchema>;
export type AcademicResultQueryInput = z.infer<typeof AcademicResultQuerySchema>;

export type AcademicResultSheetCreateInput = AcademicResultCreateInput;
export type AcademicResultSheetUpdateInput = AcademicResultUpdateInput;
