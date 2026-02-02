import { Router } from "express";
import { z } from "zod";
import { SafetyController } from "../controllers/safety.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const reportSchema = z.object({
  body: z.object({
    reason: z.enum([
      "harassment",
      "fake_profile",
      "inappropriate_content",
      "spam",
      "threatening_behavior",
      "underage",
      "scam",
      "other",
    ]),
    description: z.string().max(1000).optional(),
  }),
});

const resolveReportSchema = z.object({
  body: z.object({
    action: z.enum(["resolved", "dismissed"]),
    admin_notes: z.string().max(1000).optional(),
  }),
});

export const createSafetyRoutes = (safetyController: SafetyController) => {
  // Block/Unblock
  router.post("/block/:userId", authenticate, safetyController.blockUser);
  router.delete("/block/:userId", authenticate, safetyController.unblockUser);
  router.get("/blocked", authenticate, safetyController.getBlockedUsers);

  // Report
  router.post(
    "/report/:userId",
    authenticate,
    validate(reportSchema),
    safetyController.reportUser
  );

  // Admin moderation
  router.get("/admin/reports", authenticate, safetyController.getReports);
  router.patch(
    "/admin/reports/:reportId",
    authenticate,
    validate(resolveReportSchema),
    safetyController.resolveReport
  );
  router.post("/admin/suspend/:userId", authenticate, safetyController.suspendUser);

  return router;
};
