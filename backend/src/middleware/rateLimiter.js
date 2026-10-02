const rateLimit = require('express-rate-limit');

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs, limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
  });

// In-memory store = per-process. For multiple instances, switch to rate-limit-redis.
const createLimiter = make(60 * 1000, 10, 'Too many URLs created, slow down.');
const authLimiter = make(15 * 60 * 1000, 20, 'Too many auth attempts, try again later.');
const redirectLimiter = make(60 * 1000, 600, 'Too many requests.');
// Tighter than authLimiter: each hit sends a real email, so abuse here costs money/quota, not just CPU.
const otpLimiter = make(15 * 60 * 1000, 8, 'Too many verification code requests, try again later.');

module.exports = { createLimiter, authLimiter, redirectLimiter, otpLimiter };
