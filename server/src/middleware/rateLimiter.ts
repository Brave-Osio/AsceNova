import rateLimit from 'express-rate-limit';

/** Applied to the unauthenticated auth routes (register/login/forgot-password) — per-IP. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});
