import { Router } from "express";
import { z } from "zod";
import { MatchingController } from "../controllers/matching.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const swipeSchema = z.object({
  body: z.object({
    matched_user_id: z.string().min(1),
    action: z.enum(["left", "right", "star"]),
  }),
});

export const createMatchingRoutes = (matchingController: MatchingController) => {
  router.get("/discovery", authenticate, matchingController.getDiscovery);
  router.post("/swipe", authenticate, validate(swipeSchema), matchingController.swipe);
  router.get("/mutual", authenticate, matchingController.getMutualMatches);

  return router;
};
