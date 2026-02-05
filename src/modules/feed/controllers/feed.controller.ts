import { type Request, type Response } from "express";
import { FeedService } from "../services/feed.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class FeedController {
    constructor(private feedService: FeedService) { }

    /**
     * Create a new post
     */
    createPost = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { photos, caption, tags } = req.body;

        const post = await this.feedService.createPost(userId, photos, caption, tags);
        ApiResponse.success(res, post, "Post created successfully", 201);
    });

    /**
     * Get home timeline
     */
    getTimeline = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const type = (req.query.type as "posts" | "all") || "posts";

        const result = await this.feedService.getTimeline(userId, page, limit, type);
        ApiResponse.success(res, result);
    });

    /**
     * Get discover feed
     */
    getDiscoverFeed = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await this.feedService.getDiscoverFeed(userId, page, limit);
        ApiResponse.success(res, result);
    });

    /**
     * Get single post
     */
    getPost = asyncHandler(async (req: Request, res: Response) => {
        const { postId } = req.params;

        const post = await this.feedService.getPost(postId);
        ApiResponse.success(res, post);
    });

    /**
     * Delete a post
     */
    deletePost = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const result = await this.feedService.deletePost(postId, userId);
        ApiResponse.success(res, result);
    });

    /**
     * Like/unlike a post
     */
    toggleLike = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { postId } = req.params;

        const result = await this.feedService.toggleLike(postId, userId);
        ApiResponse.success(res, result);
    });

    /**
     * Add comment to post
     */
    addComment = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { postId } = req.params;
        const { text } = req.body;

        const comment = await this.feedService.addComment(postId, userId, text);
        ApiResponse.success(res, comment, "Comment added successfully", 201);
    });

    /**
     * Get comments for a post
     */
    getComments = asyncHandler(async (req: Request, res: Response) => {
        const { postId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await this.feedService.getComments(postId, page, limit);
        ApiResponse.success(res, result);
    });

    /**
     * Get posts by a specific user
     */
    getUserPosts = asyncHandler(async (req: Request, res: Response) => {
        const requesterId = req.user!.userId;
        const { userId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await this.feedService.getUserPosts(userId, requesterId, page, limit);
        ApiResponse.success(res, result);
    });
}
