import { z } from 'zod';
import { FACULTY_STATUSES, SCHOOLS } from '../constants.js';

export const FacultyProfileUpdateSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  institutionCode: z.nativeEnum(SCHOOLS).optional().default('ANGLE_HSS' as any),
  designation: z.string().min(1, 'Designation is required').optional().default('Faculty Member'),
  department: z.string().min(1, 'Department is required').optional().default('General Academics'),
  subjects: z.array(z.string()).default([]),
  qualification: z.string().optional().default('Certified Educator'),
  experience: z.string().optional().default('10+ Years'),
  bio: z.string().max(4000).optional().nullable(),
  achievements: z.array(z.string()).default([]),
  photoUrl: z.string().optional().nullable(),
  publicContactToggles: z
    .object({
      showEmail: z.boolean().default(true).optional(),
      showPhone: z.boolean().default(true).optional(),
      email: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      officeHours: z.string().optional().nullable(),
      officeLocation: z.string().optional().nullable(),
      publications: z.array(z.string()).optional().nullable(),
      socialLinks: z.record(z.any()).optional().nullable(),
      isHead: z.boolean().optional(),
    })
    .passthrough()
    .default({}),
  status: z.nativeEnum(FACULTY_STATUSES).optional(),
}).passthrough();

export type FacultyProfileUpdateInput = z.infer<typeof FacultyProfileUpdateSchema>;
