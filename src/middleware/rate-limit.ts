import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true,
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many OTP requests, please try again later",
});

/** Stricter limiter for file uploads - 20 per 15 min */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many upload requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/** Chat message limiter - 60 messages per minute to prevent spam */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Sending messages too quickly, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
});

/** Swipe limiter - 100 swipes per 15 min */
export const swipeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many swipes, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
