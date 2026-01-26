import { Router } from "express";
import { z } from "zod";
import { FeedController } from "../controllers/feed.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const createPostSchema = z.object({
    body: z.object({
        photos: z.array(z.string().url()).min(1).max(10),
        caption: z.string().max(2200).optional().default(""),
        tags: z.array(z.string()).optional().default([]),
    }),
});

const addCommentSchema = z.object({
    body: z.object({
        text: z.string().min(1).max(1000),
    }),
});

export const createFeedRoutes = (feedController: FeedController) => {
    // All routes require authentication
    router.use(authenticate);

    // Timeline/Feed
    router.get("/", feedController.getTimeline);

    // Posts
    router.post("/posts", validate(createPostSchema), feedController.createPost);
    router.get("/posts/:postId", feedController.getPost);
    router.delete("/posts/:postId", feedController.deletePost);

    // Likes
    router.post("/posts/:postId/like", feedController.toggleLike);

    // Comments
    router.get("/posts/:postId/comments", feedController.getComments);
    router.post(
        "/posts/:postId/comments",
        validate(addCommentSchema),
        feedController.addComment
    );

    // User posts
    router.get("/users/:userId/posts", feedController.getUserPosts);

    return router;
};
