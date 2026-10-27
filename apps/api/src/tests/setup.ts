import { vi } from 'vitest';

/**
 * The reCAPTCHA verification is stubbed for the test run.
 *
 * The real check calls Google and needs a live site, so it cannot be part
 * of an automated run. The stub accepts any token that is present, which
 * is what the tests care about — that the endpoint demands a token at all,
 * and that it goes on to write the review.
 */
vi.mock('../lib/recaptcha.js', async () => {
  const { AppError } = await import('../middleware/error.js');

  return {
    verifyRecaptchaToken: async (token: unknown, expectedAction: string) => {
      if (typeof token !== 'string' || token.length < 1) {
        throw new AppError('BAD_REQUEST', 'Complete the security check and try again.', 400);
      }
      if (!['library_review', 'magazine_review'].includes(expectedAction)) {
        throw new AppError('FORBIDDEN', 'Security verification failed. Please try again.', 403);
      }
    },
  };
});
