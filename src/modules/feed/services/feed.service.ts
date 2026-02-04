import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import { Follow } from "../../users/models/follow.model";
import { User } from "../../users/models/user.model";
import { NotFoundError, ForbiddenError } from "../../../utils/errors";
import { getCachedFeed, cacheFeed, invalidateFeedCache } from "../../../config/redis";
import { logger } from "../../../utils/logger";
import mongoose from "mongoose";

export class FeedService {
    /**
     * Create a new post
     */
    async createPost(
        userId: string,
        photos: string[],
        caption: string,
        tags: string[]
    ) {
        const post = await Post.create({
            author_id: userId,
            photos,
            caption,
            tags,
            likes: [],
            comments_count: 0,
        });

        // Invalidate feed cache (new post available)
        await invalidateFeedCache(userId);

        // Populate author for response
        await post.populate("author_id", "username profile.name profile.photo_url");

        logger.info({ postId: post._id, userId }, "Post created successfully and cache invalidated");

        return post;
    }

    /**
     * Get home timeline for a user (posts from followed users + own posts)
     */
    async getTimeline(
        userId: string,
        page: number = 1,
        limit: number = 20,
        _type: "posts" | "all" = "posts"
    ) {
        // Try to get from cache for first page
        if (page === 1) {
            const cached = await getCachedFeed(userId);
            if (cached && cached.length > 0) {
                logger.debug({ userId }, "Returning cached feed");
                return {
                    posts: cached.slice(0, limit),
                    pagination: {
                        page,
                        limit,
                        hasMore: cached.length > limit,
                    },
                };
            }
        }

        // Get list of users this user follows
        const following = await Follow.find({
            follower_id: userId,
            status: "active",
        }).select("following_id");

        const followingIds = following.map((f) => f.following_id);
        // Include user's own posts - Ensuring it's an ObjectId for consistent query
        try {
            followingIds.push(new mongoose.Types.ObjectId(userId) as any);
        } catch (e) {
            logger.warn({ userId, error: e }, "Failed to convert userId to ObjectId for feed query");
            // Fallback: push as string if needed, though likely won't match if schema is strict
        }

        logger.debug({ userId, followingCount: following.length, totalFollowingIds: followingIds.length }, "Fetching timeline posts");

        const skip = (page - 1) * limit;

        const posts = await Post.find({
            author_id: { $in: followingIds },
        })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit + 1)
            .populate("author_id", "username profile.name profile.photo_url nomad_id.verified")
            .lean();

        logger.info({ userId, postsFound: posts.length, page }, "Timeline fetch completed");

        const hasMore = posts.length > limit;
        const result = posts.slice(0, limit);

        // Cache first page results (first 10 posts)
        if (page === 1 && result.length > 0) {
            await cacheFeed(userId, result.slice(0, 10));
        }

        return {
            posts: result,
            pagination: {
                page,
                limit,
                hasMore,
            },
        };
    }

    /**
     * Get a single post by ID
     */
    async getPost(postId: string) {
        const post = await Post.findById(postId)
            .populate("author_id", "username profile.name profile.photo_url nomad_id.verified")
            .lean();

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        return post;
    }

    /**
     * Delete a post (only by author)
     */
    async deletePost(postId: string, userId: string) {
        const post = await Post.findById(postId);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        if (post.author_id.toString() !== userId) {
            throw new ForbiddenError("You can only delete your own posts");
        }

        // Delete all comments on this post
        await Comment.deleteMany({ post_id: postId });

        await post.deleteOne();

        return { message: "Post deleted successfully" };
    }

    /**
     * Like/unlike a post
     */
    async toggleLike(postId: string, userId: string) {
        const post = await Post.findById(postId);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        // Check if user has already liked (compare as strings)
        const likeIndex = post.likes.findIndex((id) => id.toString() === userId);
        const isLiked = likeIndex !== -1;

        if (isLiked) {
            // Unlike - remove from array using splice
            post.likes.splice(likeIndex, 1);
            logger.info({ postId, userId, action: "unlike" }, "User unliked post");
        } else {
            // Like - convert userId to ObjectId before pushing
            const mongoose = require('mongoose');
            post.likes.push(new mongoose.Types.ObjectId(userId) as any);
            logger.info({ postId, userId, action: "like" }, "User liked post");
        }

        // Mark the array as modified for Mongoose
        post.markModified('likes');
        await post.save();

        // Verify the save by fetching fresh data
        const updatedPost = await Post.findById(postId);

        // Invalidate feed cache for this user so they see the updated like status immediately
        await invalidateFeedCache(userId);

        return {
            liked: !isLiked,
            likes_count: updatedPost?.likes.length || 0,
        };
    }

    /**
     * Add a comment to a post
     */
    async addComment(postId: string, userId: string, text: string) {
        const post = await Post.findById(postId);

        if (!post) {
            throw new NotFoundError("Post not found");
        }

        const comment = await Comment.create({
            post_id: postId,
            author_id: userId,
            text,
        });

        // Increment comments count
        post.comments_count += 1;
        await post.save();

        await comment.populate("author_id", "username profile.name profile.photo_url");

        return comment;
    }

    /**
     * Get comments for a post
     */
    async getComments(postId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ post_id: postId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit + 1)
            .populate("author_id", "username profile.name profile.photo_url")
            .lean();

        const hasMore = comments.length > limit;

        return {
            comments: comments.slice(0, limit),
            pagination: {
                page,
                limit,
                hasMore,
            },
        };
    }

    /**
     * Get posts by a specific user
     */
    async getUserPosts(
        targetUserId: string,
        requesterId: string,
        page: number = 1,
        limit: number = 20
    ) {
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            throw new NotFoundError("User not found");
        }

        // Check if target user is private and requester is not following
        if (targetUser.is_private && targetUserId !== requesterId) {
            const isFollowing = await Follow.findOne({
                follower_id: requesterId,
                following_id: targetUserId,
                status: "active",
            });

            if (!isFollowing) {
                throw new ForbiddenError("This account is private");
            }
        }

        const skip = (page - 1) * limit;

        const posts = await Post.find({ author_id: targetUserId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit + 1)
            .populate("author_id", "username profile.name profile.photo_url")
            .lean();

        const hasMore = posts.length > limit;

        return {
            posts: posts.slice(0, limit),
            pagination: {
                page,
                limit,
                hasMore,
            },
        };
    }
}
