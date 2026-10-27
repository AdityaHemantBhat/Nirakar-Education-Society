import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP per window
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again in 15 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const directoryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Directory query rate limit exceeded, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const communityPostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Post activity limit reached. Please try again shortly.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many contact messages sent, please wait before submitting again',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const facultyMessageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many messages sent. Please wait before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Reviews are open to anyone, so the endpoint is reachable without an
 * account. The reCAPTCHA token stops it being flooded, but a limiter is
 * still needed so one device cannot post a review every few seconds.
 */
export const eventCommentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many event comments submitted. Please try again in a few minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const magazineReviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many magazine reviews submitted. Please try again in a few minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const libraryReviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many reviews submitted. Please try again in a few minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const mediaUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many media uploads. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
