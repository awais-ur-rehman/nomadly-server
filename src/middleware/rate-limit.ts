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
