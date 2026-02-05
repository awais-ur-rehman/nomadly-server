import { Router } from "express";
import { z } from "zod";
import { MatchingController } from "../controllers/matching.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";
import { swipeLimiter } from "../../../middleware/rate-limit";

const router = Router();

const updatePreferencesSchema = z.object({
  body: z.object({
    intent: z.enum(["friends", "dating", "both"]).optional(),
    preferences: z.object({
      gender_interest: z.array(z.string()).optional(),
      min_age: z.number().min(18).optional(),
      max_age: z.number().max(100).optional(),
      max_distance_km: z.number().positive().optional(),
    }).optional(),
    is_discoverable: z.boolean().optional(),
  }),
});

const swipeSchema = z.object({
  body: z.object({
    targetUserId: z.string().optional(),
    matched_user_id: z.string().optional(), // Backward compatibility
    action: z.enum(["like", "pass", "super_like"]),
  }).refine(data => data.targetUserId || data.matched_user_id, {
    message: "Either targetUserId or matched_user_id is required"
  }),
});

const caravanResponseSchema = z.object({
  body: z.object({
    status: z.enum(["accepted", "rejected"]),
  }),
});

export const createMatchingRoutes = (matchingController: MatchingController) => {
  // Preferences
  router.patch("/preferences", authenticate, validate(updatePreferencesSchema), matchingController.updatePreferences);

  // Recommendations (The Feed)
  router.get("/recommendations", authenticate, matchingController.getRecommendations);
  // Alias for backward compatibility
  router.get("/discovery", authenticate, matchingController.getDiscovery);

  // Actions
  router.post("/swipe", authenticate, swipeLimiter, validate(swipeSchema), matchingController.swipe);

  // Matches List
  router.get("/matches", authenticate, matchingController.getMatches);
  // Alias for backward compatibility
  router.get("/mutual", authenticate, matchingController.getMutualMatches);

  // Caravan Joining
  router.post("/caravan/request", authenticate, matchingController.sendCaravanRequest);
  router.get("/caravan/requests", authenticate, matchingController.getCaravanRequests);
  router.patch("/caravan/requests/:requestId", authenticate, validate(caravanResponseSchema), matchingController.respondToCaravanRequest);

  return router;
};
