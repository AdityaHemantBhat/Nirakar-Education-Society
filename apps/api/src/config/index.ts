import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

// Load local environment files for development and tests.
if (process.loadEnvFile) {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../.env'),
  ];
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        process.loadEnvFile(envPath);
        if (process.env.DATABASE_URL) break;
        } catch { /* Try the next candidate. */ }
    }
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_PORT: z.coerce.number().default(5000),
  ADMIN_PORT: z.coerce.number().default(5001),
  ADMIN_BASE_PATH: z.string().default('/admin'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/nirakar?schema=public'),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev_jwt_access_secret_super_secure_32chars_min_nirakar_2026'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev_jwt_refresh_secret_super_secure_32chars_min_nirakar_2026'),
  COOKIE_SECRET: z.string().min(16).default('dev_cookie_session_secret_signing_nirakar_32chars_long'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  CORS_ORIGIN: z.string().default('http://localhost:5000,http://localhost:5001'),
  SUPER_ADMIN_EMAIL: z.string().email().default('admin@nirakar.org'),
  SUPER_ADMIN_PASSWORD: z.string().default('dev_change_this_password_before_use'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder_key_id'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_placeholder_secret_key'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_secret_for_signature_verification'),
  STORAGE_DRIVER: z.enum(['local', 's3', 'cloudinary']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./uploads'),
  FB_PAGE_ID: z.string().optional().default('NirakarVidyalay'),
  FB_PAGE_TOKEN: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().default(''),
  RECAPTCHA_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.5),
  APP_TIMEZONE: z.string().default('Asia/Kolkata'),
});

const parsedConfig = EnvSchema.parse(process.env);

if (parsedConfig.NODE_ENV === 'production') {
  const requiredSecrets = [
    ['DATABASE_URL', process.env.DATABASE_URL],
    ['JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET],
    ['JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET],
    ['COOKIE_SECRET', process.env.COOKIE_SECRET],
    ['CORS_ORIGIN', process.env.CORS_ORIGIN],
    ['RECAPTCHA_SECRET_KEY', process.env.RECAPTCHA_SECRET_KEY],
    ['RAZORPAY_KEY_ID', process.env.RAZORPAY_KEY_ID],
    ['RAZORPAY_KEY_SECRET', process.env.RAZORPAY_KEY_SECRET],
    ['RAZORPAY_WEBHOOK_SECRET', process.env.RAZORPAY_WEBHOOK_SECRET],
    ['SUPER_ADMIN_PASSWORD', process.env.SUPER_ADMIN_PASSWORD],
  ] as const;
  const missing = requiredSecrets
    .filter(([, value]) => !value || value.startsWith('dev_') || value.includes('placeholder'))
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing production configuration: ${missing.join(', ')}`);
  }
}

export const config = parsedConfig;

/**
 * Where the files that must never be served over HTTP live.
 *
 * The uploads directory is mounted as a public static route, so a source
 * PDF dropped there would be downloadable by anyone who knew its name.
 * The originals of the library volumes are kept here instead, one level
 * above the public directory, so they are reachable by the server and by
 * nothing else.
 */
export const PRIVATE_STORAGE_PATH = path.resolve(
  config.STORAGE_LOCAL_PATH,
  '..',
  'private-uploads',
);
