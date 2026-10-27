import { z } from 'zod';

/**
 * The console's own settings.
 *
 * These are the knobs an administrator is allowed to turn: the address the
 * sign-in page lives at, how long a session lasts, and the housekeeping
 * rules. The keys are stored in `site_settings` as plain strings, so a
 * setting that is not recognised is simply ignored rather than breaking
 * the console.
 */

/** Paths the system needs for itself, and which cannot be used. */
export const RESERVED_PATHS = new Set([
  'api',
  'admin',
  'assets',
  'uploads',
  'images',
  'photos',
  'logout',
  'public',
  'static',
  'www',
  'app',
  'faculty',
  'alumni',
]);

/**
 * A custom sign-in path.
 *
 * It must be a single path segment, so that `/signin` works and
 * `/signin/secret` does not — a path with a slash in it would need the
 * whole router to be rewritten, and a path that reaches the filesystem or
 * the API is a hazard.
 */
export const AdminLoginPathSchema = z
  .string()
  .trim()
  .min(3, 'The sign-in path must be at least 3 characters')
  .max(48, 'The sign-in path must be at most 48 characters')
  .regex(
    /^[a-z0-9][a-z0-9-]*$/i,
    'Use only letters, numbers and hyphens — for example “signin-7f3a”',
  )
  .refine((v) => !RESERVED_PATHS.has(v.toLowerCase()), 'That path is reserved by the system')
  .transform((v) => v.toLowerCase());

/** How long a sign-in session lasts, in hours. */
export const SessionLengthSchema = z.coerce
  .number()
  .int()
  .min(1, 'A session must last at least an hour')
  .max(720, 'A session may last at most 720 hours (30 days)');

/** How many days an entry in the activity log is kept. */
export const AuditRetentionSchema = z.coerce
  .number()
  .int()
  .min(7, 'The log must keep at least a week')
  .max(3650, 'The log may keep at most ten years');

/** The settings an administrator may change. */
export const ConsoleSettingsSchema = z.object({
  /* The custom sign-in path, without a leading slash. */
  adminLoginPath: AdminLoginPathSchema,
  /* How long a session lasts, in hours. */
  sessionLengthHours: SessionLengthSchema,
  /* How long the activity log is kept, in days. */
  auditRetentionDays: AuditRetentionSchema,
  /* Whether a new sign-in is recorded in the log. */
  logSignIns: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(true),
  /* Whether the console shows the current administrator's email address. */
  showAccountEmail: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(false),
});

export type ConsoleSettings = z.infer<typeof ConsoleSettingsSchema>;

/**
 * Changing one's own password.
 *
 * The current password is required, so that a session left open on a
 * shared machine cannot be used to take the account over.
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(200),
  newPassword: z
    .string()
    .min(10, 'The new password must be at least 10 characters')
    .max(200)
    .regex(/[a-z]/, 'The new password must contain a lower-case letter')
    .regex(/[A-Z]/, 'The new password must contain an upper-case letter')
    .regex(/[0-9]/, 'The new password must contain a number'),
  confirmPassword: z.string().max(200),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'The two passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/**
 * Super Admin managing other Administrator & Editor accounts.
 */
export const CreateAdminUserSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens and underscores'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[a-z]/, 'Password must contain a lower-case letter')
    .regex(/[A-Z]/, 'Password must contain an upper-case letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  role: z.enum(['ADMIN', 'EDITOR']),
});

export type CreateAdminUserInput = z.infer<typeof CreateAdminUserSchema>;

export const ResetAdminPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[a-z]/, 'Password must contain a lower-case letter')
    .regex(/[A-Z]/, 'Password must contain an upper-case letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export type ResetAdminPasswordInput = z.infer<typeof ResetAdminPasswordSchema>;
