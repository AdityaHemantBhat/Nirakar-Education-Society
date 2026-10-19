import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

// Automatically load .env if available
if (process.loadEnvFile) {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../.env'),
    'D:/Adi Works/Nirakar Education Society/.env',
  ];
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        process.loadEnvFile(envPath);
        if (process.env.DATABASE_URL) break;
      } catch {
        // continue
      }
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
  CORS_ORIGIN: z.string().default('http://localhost:5000,http://localhost:5001'),
  SUPER_ADMIN_EMAIL: z.string().email().default('admin@nirakar.org'),
  SUPER_ADMIN_PASSWORD: z.string().default('Nirakar@Admin2026!'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder_key_id'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_placeholder_secret_key'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_secret_for_signature_verification'),
  STORAGE_DRIVER: z.enum(['local', 's3', 'cloudinary']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./uploads'),
  FB_PAGE_ID: z.string().optional().default('NirakarVidyalay'),
  FB_PAGE_TOKEN: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().default(''),
  RECAPTCHA_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.5),
});

export const config = EnvSchema.parse(process.env);
