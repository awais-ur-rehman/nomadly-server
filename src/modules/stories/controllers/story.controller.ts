import { type Request, type Response } from "express";
import { StoryService } from "../services/story.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class StoryController {
    constructor(private storyService: StoryService) { }

    /**
     * Create a new story
     */
    createStory = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { asset_url, type, asset_type } = req.body;

        const story = await this.storyService.createStory(userId, asset_url, type || asset_type);
        ApiResponse.success(res, story, "Story created successfully", 201);
    });

    /**
     * Get active stories from followed users
     */
    getActiveStories = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        const stories = await this.storyService.getActiveStories(userId);
        ApiResponse.success(res, stories);
    });

    /**
     * Get a single story
     */
    getStory = asyncHandler(async (req: Request, res: Response) => {
        const viewerId = req.user!.userId;
        const { storyId } = req.params;

        const story = await this.storyService.getStory(storyId, viewerId);
        ApiResponse.success(res, story);
    });

    /**
     * Get my stories
     */
    getMyStories = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        const stories = await this.storyService.getMyStories(userId);
        ApiResponse.success(res, stories);
    });

    /**
     * Delete a story
     */
    deleteStory = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { storyId } = req.params;

        const result = await this.storyService.deleteStory(storyId, userId);
        ApiResponse.success(res, result);
    });

    /**
     * Get story viewers
     */
    getStoryViewers = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { storyId } = req.params;

        const result = await this.storyService.getStoryViewers(storyId, userId);
        ApiResponse.success(res, result);
    });
}
