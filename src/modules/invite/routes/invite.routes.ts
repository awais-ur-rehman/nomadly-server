import { Router } from "express";
import { z } from "zod";
import { InviteController } from "../controllers/invite.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const generateCodeSchema = z.object({
  body: z.object({
    max_uses: z.number().min(1).max(5).optional(),
  }),
});

export const createInviteRoutes = (inviteController: InviteController) => {
  // Generate a new invite code (authenticated)
  router.post(
    "/generate",
    authenticate,
    validate(generateCodeSchema),
    inviteController.generateCode
  );

  // List my invite codes (authenticated)
  router.get("/my-codes", authenticate, inviteController.getMyCodes);

  // Revoke an invite code (authenticated)
  router.delete("/:codeId", authenticate, inviteController.revokeCode);

  // Validate a code (public - used during registration)
  router.get("/validate/:code", inviteController.validateCode);

  // View my invitation tree (authenticated)
  router.get("/tree", authenticate, inviteController.getInviteTree);

  return router;
};
