import { Router } from "express";
import { z } from "zod";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../../../middleware/validation";
import { authLimiter, otpLimiter } from "../../../middleware/rate-limit";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    phone: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const createAuthRoutes = (authController: AuthController) => {
  router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    authController.register
  );

  router.post(
    "/verify-otp",
    authLimiter,
    validate(verifyOtpSchema),
    authController.verifyOtp
  );

  router.post("/login", authLimiter, validate(loginSchema), authController.login);

  router.post(
    "/refresh",
    validate(refreshTokenSchema),
    authController.refreshToken
  );

  router.post(
    "/resend-otp",
    otpLimiter,
    validate(resendOtpSchema),
    authController.resendOtp
  );

  return router;
};
