import { Router } from "express";
import { z } from "zod";
import { VerificationController } from "../controllers/verification.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const submitPhoneSchema = z.object({
  body: z.object({
    phone_number: z
      .string()
      .min(7)
      .max(20)
      .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number format"),
  }),
});

const submitPhotoSchema = z.object({
  body: z.object({
    selfie_url: z.string().url("Must be a valid URL"),
  }),
});

const submitIdDocumentSchema = z.object({
  body: z.object({
    document_url: z.string().url("Must be a valid URL"),
    document_type: z.enum(["drivers_license", "passport", "national_id"]),
  }),
});

const adminReviewSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject"]),
    rejection_reason: z.string().max(500).optional(),
  }),
});

export const createVerificationRoutes = (verificationController: VerificationController) => {
  // ─── User endpoints ───
  router.get("/status", authenticate, verificationController.getStatus);
  router.post("/phone", authenticate, validate(submitPhoneSchema), verificationController.submitPhone);
  router.post("/photo", authenticate, validate(submitPhotoSchema), verificationController.submitPhoto);
  router.post("/id-document", authenticate, validate(submitIdDocumentSchema), verificationController.submitIdDocument);
  router.post("/community/refresh", authenticate, verificationController.refreshCommunity);

  // ─── Admin endpoints ───
  router.get("/admin/pending", authenticate, verificationController.getPending);
  router.patch("/admin/phone/:userId", authenticate, validate(adminReviewSchema), verificationController.reviewPhone);
  router.patch("/admin/photo/:userId", authenticate, validate(adminReviewSchema), verificationController.reviewPhoto);
  router.patch("/admin/id-document/:userId", authenticate, validate(adminReviewSchema), verificationController.reviewIdDocument);

  return router;
};
