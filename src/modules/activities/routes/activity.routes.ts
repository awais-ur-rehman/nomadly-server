import { Router } from "express";
import { z } from "zod";
import { ActivityController } from "../controllers/activity.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const createActivitySchema = z.object({
  body: z.object({
    activity_type: z.string().min(1),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    max_participants: z.number().positive(),
    event_time: z.string().datetime(),
    description: z.string().optional(),
    verified_only: z.boolean().optional(),
  }),
});

export const createActivityRoutes = (activityController: ActivityController) => {
  router.post(
    "/",
    authenticate,
    validate(createActivitySchema),
    activityController.createActivity
  );
  router.get("/nearby", authenticate, activityController.getNearby);
  router.post(
    "/:id/join",
    authenticate,
    activityController.requestJoin
  );
  router.patch(
    "/:id/approve/:userId",
    authenticate,
    activityController.approveParticipant
  );
  router.patch(
    "/:id/reject/:userId",
    authenticate,
    activityController.rejectParticipant
  );

  return router;
};
