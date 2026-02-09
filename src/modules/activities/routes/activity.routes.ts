import { Router } from "express";
import { z } from "zod";
import { ActivityController } from "../controllers/activity.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const createActivitySchema = z.object({
  body: z.object({
    activity_type: z.string().min(1).optional(),
    type: z.string().min(1).optional(), // Alias for activity_type

    location: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      latitude: z.number().optional(), // Alias for lat
      longitude: z.number().optional(), // Alias for lng
    }).refine(data => (data.lat !== undefined && data.lng !== undefined) || (data.latitude !== undefined && data.longitude !== undefined), {
      message: "Location must comprise lat/lng or latitude/longitude"
    }),

    max_participants: z.number().positive().optional(),
    maxParticipants: z.number().positive().optional(), // Alias

    event_time: z.string().optional(),
    startTime: z.string().optional(), // Alias

    title: z.string().optional(), // Accepted but might be ignored or used as description prefix
    description: z.string().optional(),
    verified_only: z.boolean().optional(),
  }).refine(data => data.activity_type || data.type, {
    message: "activity_type or type is required",
    path: ["activity_type"]
  }).refine(data => data.event_time || data.startTime, {
    message: "event_time or startTime is required",
    path: ["event_time"]
  }).refine(data => data.max_participants || data.maxParticipants, {
    message: "max_participants or maxParticipants is required",
    path: ["max_participants"]
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
  router.get("/mine", authenticate, activityController.getMyHosted);
  router.get("/joined", authenticate, activityController.getMyJoined);
  router.get("/:id", authenticate, activityController.getActivity);
  router.patch("/:id", authenticate, activityController.updateActivity);
  router.delete("/:id", authenticate, activityController.deleteActivity);
  router.post(
    "/:id/join",
    authenticate,
    activityController.requestJoin
  );
  router.delete("/:id/leave", authenticate, activityController.leaveActivity);
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
