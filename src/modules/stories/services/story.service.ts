import { Story } from "../models/story.model";
import { Follow } from "../../users/models/follow.model";
import { NotFoundError, ForbiddenError } from "../../../utils/errors";

export class StoryService {
    private readonly STORY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Create a new story (expires in 24 hours)
     */
    async createStory(
        userId: string,
        assetUrl: string,
        assetType: "image" | "video"
    ) {
        const expiresAt = new Date(Date.now() + this.STORY_DURATION_MS);

        const story = await Story.create({
            author_id: userId,
            asset_url: assetUrl,
            asset_type: assetType,
            views: [],
            expires_at: expiresAt,
        });

        await story.populate("author_id", "username profile.name profile.photo_url");

        return story;
    }

    /**
     * Get active stories from followed users AND current user
     */
    async getActiveStories(userId: string) {
        // Get list of users this user follows
        const following = await Follow.find({
            follower_id: userId,
            status: "active",
        }).select("following_id");

        const followingIds = following.map((f) => f.following_id);
        // Include user's own stories - convert to ObjectId for aggregation
        const mongoose = require('mongoose');
        followingIds.push(new mongoose.Types.ObjectId(userId));

        // Get active stories (not expired)
        const now = new Date();

        // Group stories by author
        const stories = await Story.aggregate([
            {
                $match: {
                    author_id: { $in: followingIds },
                    expires_at: { $gt: now },
                },
            },
            {
                $sort: { created_at: -1 },
            },
            {
                $group: {
                    _id: "$author_id",
                    stories: { $push: "$$ROOT" },
                    latestStory: { $first: "$$ROOT" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "author",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                "profile.name": 1,
                                "profile.photo_url": 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: "$author",
            },
            {
                $sort: { "latestStory.created_at": -1 },
            },
            {
                $project: {
                    author: 1,
                    stories: 1,
                    hasUnviewed: {
                        $anyElementTrue: {
                            $map: {
                                input: "$stories",
                                as: "story",
                                in: { $not: { $in: [userId, "$$story.views"] } },
                            },
                        },
                    },
                },
            },
        ]);

        return stories;
    }

    /**
     * Get a single story
     */
    async getStory(storyId: string, viewerId: string) {
        const story = await Story.findById(storyId)
            .populate("author_id", "username profile.name profile.photo_url")
            .lean();

        if (!story) {
            throw new NotFoundError("Story not found or expired");
        }

        // Mark as viewed if not already
        if (!story.views.some((id: any) => id.toString() === viewerId)) {
            await Story.findByIdAndUpdate(storyId, {
                $addToSet: { views: viewerId },
            });
        }

        return story;
    }

    /**
     * Get user's own stories
     */
    async getMyStories(userId: string) {
        const now = new Date();

        const stories = await Story.find({
            author_id: userId,
            expires_at: { $gt: now },
        })
            .sort({ created_at: -1 })
            .lean();

        return stories;
    }

    /**
     * Delete a story (only by author)
     */
    async deleteStory(storyId: string, userId: string) {
        const story = await Story.findById(storyId);

        if (!story) {
            throw new NotFoundError("Story not found");
        }

        if (story.author_id.toString() !== userId) {
            throw new ForbiddenError("You can only delete your own stories");
        }

        await story.deleteOne();

        return { message: "Story deleted successfully" };
    }

    /**
     * Get story viewers (for story owner)
     */
    async getStoryViewers(storyId: string, userId: string) {
        const story = await Story.findById(storyId)
            .populate("views", "username profile.name profile.photo_url")
            .lean();

        if (!story) {
            throw new NotFoundError("Story not found");
        }

        if (story.author_id.toString() !== userId) {
            throw new ForbiddenError("You can only view viewers of your own stories");
        }

        return {
            viewers: story.views,
            count: story.views.length,
        };
    }
}
