import { Router } from "express";
import { z } from "zod";
import { UserController } from "../controllers/user.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const updateProfileSchema = z.object({
  body: z.object({
    profile: z
      .object({
        name: z.string().optional(),
        age: z.number().optional(),
        gender: z.string().optional(),
        photo_url: z.string().optional(),
        hobbies: z.array(z.string()).optional(),
        intent: z.enum(["friends", "dating", "both"]).optional(),
        bio: z.string().optional(),
      })
      .optional(),
    rig: z
      .object({
        type: z.enum(["sprinter", "skoolie", "suv", "truck_camper"]).optional(),
        crew_type: z.enum(["solo", "couple", "with_pets"]).optional(),
        pet_friendly: z.boolean().optional(),
      })
      .optional(),
    is_builder: z.boolean().optional(),
    builder_profile: z
      .object({
        specialty_tags: z.array(z.string()).optional(),
        hourly_rate: z.number().optional(),
        availability_status: z.enum(["available", "busy"]).optional(),
        bio: z.string().optional(),
      })
      .optional(),
  }),
});

const completeProfileSchema = z.object({
  body: z.object({
    profile: z
      .object({
        hobbies: z.array(z.string()).optional(),
        intent: z.enum(["friends", "dating", "both"]).optional(),
        bio: z.string().optional(),
        photo_url: z.string().optional(),
      })
      .optional(),
    rig: z
      .object({
        type: z.enum(["sprinter", "skoolie", "suv", "truck_camper"]).optional(),
        crew_type: z.enum(["solo", "couple", "with_pets"]).optional(),
        pet_friendly: z.boolean().optional(),
      })
      .optional(),
  }),
});

const updateRouteSchema = z.object({
  body: z.object({
    origin: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    destination: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    start_date: z.string().datetime(),
    duration_days: z.number().positive(),
  }),
});

export const createUserRoutes = (userController: UserController) => {
  router.get("/me", authenticate, userController.getMe);
  router.patch(
    "/me",
    authenticate,
    validate(updateProfileSchema),
    userController.updateProfile
  );
  router.post(
    "/complete-profile",
    authenticate,
    validate(completeProfileSchema),
    userController.completeProfile
  );
  router.patch(
    "/route",
    authenticate,
    validate(updateRouteSchema),
    userController.updateRoute
  );
  router.get("/search", authenticate, userController.searchUsers);
  router.patch("/toggle-builder", authenticate, userController.toggleBuilderStatus);

  // User profile
  router.get("/:userId", authenticate, userController.getUserById);

  // Follow routes
  router.post("/:userId/follow", authenticate, userController.followUser);
  router.delete("/:userId/follow", authenticate, userController.unfollowUser);
  router.get("/:userId/followers", userController.getFollowers);
  router.get("/:userId/following", userController.getFollowing);

  return router;
};
