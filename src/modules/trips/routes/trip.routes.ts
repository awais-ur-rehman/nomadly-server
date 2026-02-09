import { Router } from "express";
import { z } from "zod";
import { TripController } from "../controllers/trip.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const createTripSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    origin: z.object({
      lat: z.number(),
      lng: z.number(),
      place_name: z.string().optional(),
    }),
    destination: z.object({
      lat: z.number(),
      lng: z.number(),
      place_name: z.string().optional(),
    }),
    start_date: z.string().datetime(),
    duration_days: z.number().positive().max(365),
    looking_for_companions: z.boolean().optional(),
    max_companions: z.number().positive().max(20).optional(),
    visibility: z.enum(["public", "followers_only", "private"]).optional(),
  }),
});

const updateTripSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    origin: z.object({
      lat: z.number(),
      lng: z.number(),
      place_name: z.string().optional(),
    }).optional(),
    destination: z.object({
      lat: z.number(),
      lng: z.number(),
      place_name: z.string().optional(),
    }).optional(),
    start_date: z.string().datetime().optional(),
    duration_days: z.number().positive().max(365).optional(),
    looking_for_companions: z.boolean().optional(),
    max_companions: z.number().positive().max(20).optional(),
    status: z.enum(["planning", "active", "completed", "cancelled"]).optional(),
    visibility: z.enum(["public", "followers_only", "private"]).optional(),
  }),
});

const showInterestSchema = z.object({
  body: z.object({
    message: z.string().max(500).optional(),
  }),
});

export const createTripRoutes = (tripController: TripController) => {
  // CRUD operations
  router.post(
    "/",
    authenticate,
    validate(createTripSchema),
    tripController.createTrip
  );

  router.get("/mine", authenticate, tripController.getMyTrips);
  router.get("/joined", authenticate, tripController.getTripsJoined);
  router.get("/nearby", authenticate, tripController.getNearbyTrips);

  router.get("/:id", authenticate, tripController.getTrip);

  router.patch(
    "/:id",
    authenticate,
    validate(updateTripSchema),
    tripController.updateTrip
  );

  router.delete("/:id", authenticate, tripController.deleteTrip);

  // Interest management
  router.post(
    "/:id/interest",
    authenticate,
    validate(showInterestSchema),
    tripController.showInterest
  );

  router.delete("/:id/interest", authenticate, tripController.cancelInterest);

  router.patch(
    "/:id/interest/:userId/accept",
    authenticate,
    tripController.acceptInterest
  );

  router.patch(
    "/:id/interest/:userId/decline",
    authenticate,
    tripController.declineInterest
  );

  // Leave trip (for companions)
  router.delete("/:id/leave", authenticate, tripController.leaveTrip);

  return router;
};
