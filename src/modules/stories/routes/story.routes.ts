import { Router } from "express";
import { z } from "zod";
import { StoryController } from "../controllers/story.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const createStorySchema = z.object({
    body: z.object({
        asset_url: z.string().url(),
        type: z.enum(["image", "video"]).optional(),
        asset_type: z.enum(["image", "video"]).optional(),
    }).refine(data => data.type || data.asset_type, {
        message: "type or asset_type is required",
        path: ["type"]
    }),
});

export const createStoryRoutes = (storyController: StoryController) => {
    // All routes require authentication
    router.use(authenticate);

    // Get active stories from followed users
    router.get("/active", storyController.getActiveStories);

    // Get my own stories
    router.get("/me", storyController.getMyStories);

    // Create a new story
    router.post("/", validate(createStorySchema), storyController.createStory);

    // Get a single story
    router.get("/:storyId", storyController.getStory);

    // Delete a story
    router.delete("/:storyId", storyController.deleteStory);

    // Get story viewers
    router.get("/:storyId/viewers", storyController.getStoryViewers);

    return router;
};
