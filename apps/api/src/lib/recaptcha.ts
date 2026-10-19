import { AppError } from '../middleware/error.js';
import { config } from '../config/index.js';

export async function verifyRecaptchaToken(token: unknown, expectedAction: string) {
  if (typeof token !== 'string' || token.length < 1 || token.length > 4096) {
    throw new AppError('BAD_REQUEST', 'Complete the security check and try again.', 400);
  }

  if (!config.RECAPTCHA_SECRET_KEY) {
    throw new AppError(
      'SERVICE_UNAVAILABLE',
      'Security verification is not configured. Please try again later.',
      503
    );
  }

  let response: Response;
  try {
    response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: config.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new AppError('SERVICE_UNAVAILABLE', 'Security verification is temporarily unavailable.', 503);
  }

  if (!response.ok) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Security verification is temporarily unavailable.', 503);
  }

  let result: { success?: boolean; action?: string; score?: number };
  try {
    result = (await response.json()) as typeof result;
  } catch {
    throw new AppError('SERVICE_UNAVAILABLE', 'Security verification returned an invalid response.', 503);
  }

  if (
    result.success !== true ||
    result.action !== expectedAction ||
    typeof result.score !== 'number' ||
    result.score < config.RECAPTCHA_MIN_SCORE
  ) {
    throw new AppError('FORBIDDEN', 'Security verification failed. Please try again.', 403);
  }
}
