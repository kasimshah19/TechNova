import rateLimit from 'express-rate-limit';

/** Auth limiter — strict, blocks brute-force login attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

/** Generic API limiter — protects Gemini-costly endpoints. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.' },
});

/** Heavy limiter for scan / image / content generation. */
export const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8, // 8 generation calls/min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI generation requests. Wait a minute and try again.' },
});
