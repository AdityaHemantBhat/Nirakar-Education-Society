import { z } from 'zod';

// Strict sanitization helper for purely numeric strings (Aadhaar, Phone, PIN)
export const sanitizeDigitsOnly = (val: unknown): string => {
  if (typeof val !== 'string' && typeof val !== 'number') return '';
  return String(val).replace(/\D/g, '');
};

// Strict text sanitization to strip potential XSS tags
export const sanitizeText = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '') // remove HTML tag brackets
    .trim();
};

export const submitAdmissionSchema = z.object({
  institutionCode: z.enum(['NIRAKAR_HS', 'ANGLE_HSS', 'TUDAL_HS']),
  gradeApplied: z.string().min(1, 'Grade/Class applied for is required').max(30),
  stream: z.string().max(100).optional().nullable(),
  studentName: z.string().min(2, 'Full Student Name is required').max(120),
  dob: z.string().min(4, 'Valid Date of Birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  placeOfBirth: z.string().max(100).optional().nullable(),
  nationality: z.string().max(50).default('Indian'),
  motherTongue: z.string().max(50).default('Konkani'),
  // Aadhaar strictly 12 digits
  aadhaarNumber: z
    .string()
    .transform(sanitizeDigitsOnly)
    .refine((v) => /^\d{12}$/.test(v), {
      message: 'Aadhaar must be exactly 12 numeric digits without letters or special characters',
    }),
  category: z.enum(['GENERAL', 'OBC', 'ST', 'SC', 'EWS']).default('GENERAL'),
  bloodGroup: z.string().max(10).optional().nullable(),
  fatherName: z.string().min(2, "Father's Full Name is required").max(120),
  fatherOccupation: z.string().max(100).optional().nullable(),
  motherName: z.string().min(2, "Mother's Full Name is required").max(120),
  motherOccupation: z.string().max(100).optional().nullable(),
  // Indian Mobile Number strictly 10 digits starting with 6, 7, 8, or 9
  primaryPhone: z
    .string()
    .transform(sanitizeDigitsOnly)
    .refine((v) => /^[6-9]\d{9}$/.test(v), {
      message: 'Mobile number must be a valid 10-digit Indian phone number starting with 6, 7, 8, or 9',
    }),
  alternatePhone: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeDigitsOnly(v) : ''))
    .refine((v) => !v || /^\d{10}$/.test(v), {
      message: 'Alternate contact number must be 10 numeric digits if provided',
    }),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(5, 'Residential address is required').max(300),
  village: z.string().min(2, 'Village/Town is required').max(100),
  taluka: z.string().max(50).default('Canacona'),
  district: z.string().max(50).default('South Goa'),
  state: z.string().max(50).default('Goa'),
  pincode: z
    .string()
    .transform(sanitizeDigitsOnly)
    .refine((v) => /^\d{6}$/.test(v), {
      message: 'PIN Code must be exactly 6 numeric digits',
    }),
  previousSchool: z.string().max(150).optional().nullable(),
  previousClass: z.string().max(30).optional().nullable(),
  previousPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  photoData: z.string().max(500000, 'Photo data payload exceeds maximum size').optional().nullable(),
  signatureData: z.string().max(500000, 'Signature data payload exceeds maximum size').optional().nullable(),
  declarationAccepted: z.boolean().refine((v) => v === true, {
    message: 'You must confirm the truthfulness of the provided particulars',
  }),
});

export const updateAdmissionConfigSchema = z.object({
  isOpen: z.boolean(),
  academicYear: z.string().min(4, 'Academic year is required (e.g. 2026–2027)').max(25),
  announcementText: z.string().max(500).optional().nullable(),
  guidelinesUrl: z.string().max(300).optional().nullable(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ADMITTED', 'REJECTED']),
  adminRemarks: z.string().max(500).optional().nullable(),
});

export type SubmitAdmissionInput = z.infer<typeof submitAdmissionSchema>;
export type UpdateAdmissionConfigInput = z.infer<typeof updateAdmissionConfigSchema>;
