import { z } from 'zod';
import { SCHOOLS } from '../constants.js';

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Please enter your email or username').max(254),
  password: z.string().min(6, 'Password must be at least 6 characters').max(256),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AlumniRegisterSchema = z
  .object({
    firstName: z.string().min(2, 'First name is required (min 2 characters)'),
    middleName: z.string().optional().default(''),
    lastName: z.string().min(2, 'Last name is required (min 2 characters)'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^[0-9+ -]{10,15}$/, 'Please enter a valid phone number (10-15 digits)'),
    school: z.nativeEnum(SCHOOLS),
    batchYear: z.number().int().min(1960).max(new Date().getFullYear()),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens and underscores'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  consent: z.literal(true, {
      message: 'You must consent to the privacy policy and storage of your alumni profile details',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type AlumniRegisterInput = z.infer<typeof AlumniRegisterSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
