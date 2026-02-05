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
    username: z.string().max(30).regex(/^[a-zA-Z0-9_]*$/, {
      message: "Username can only contain letters, numbers, and underscores"
    }).optional().or(z.literal("")),
    name: z.string().min(1),
    phone: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    invite_code: z.string().min(1, "Invite code is required"),
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
    identifier: z.string().min(1).optional(),
    email: z.string().email().optional(),
    username: z.string().optional(),
    password: z.string().min(1),
  }).refine((data) => data.identifier || data.email || data.username, {
    message: "Either identifier, email, or username must be provided",
    path: ["identifier"],
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

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(8),
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

  router.post(
    "/verify-phone",
    authLimiter,
    // Add validation schema later
    authController.verifyPhone
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

  router.post(
    "/forgot-password",
    otpLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword
  );

  router.post(
    "/reset-password",
    authLimiter,
    validate(resetPasswordSchema),
    authController.resetPassword
  );

  return router;
};
