import { User } from "../models/user.model";
import { Follow } from "../models/follow.model";
import { Block } from "../../safety/models/block.model";
import { NotFoundError } from "../../../utils/errors";
import { type GeospatialPoint } from "../../../types";
import { logger } from "../../../utils/logger";

export class UserService {
  /**
   * Check if currentUser is following targetUser
   */
  private async checkIsFollowing(currentUserId: string, targetUserId: string): Promise<{ isFollowing: boolean; isPending: boolean }> {
    const follow = await Follow.findOne({
      follower_id: currentUserId,
      following_id: targetUserId
    });

    if (!follow) {
      return { isFollowing: false, isPending: false };
    }

    return {
      isFollowing: follow.status === "active",
      isPending: follow.status === "pending"
    };
  }

  /**
   * Get user by ID with optional relationship metadata
   */
  async getUserById(userId: string, currentUserId?: string): Promise<any> {
    logger.info({ userId }, "Attempting to fetch user by ID");
    const user = await User.findById(userId).select("-password_hash");

    if (!user) {
      const allUsersCount = await User.countDocuments();
      logger.error({ userId, totalUsersInDB: allUsersCount }, "User not found in database");
      throw new NotFoundError("User not found");
    }

    const userObj = user.toObject();

    // Calculate counts
    const followerCount = await Follow.countDocuments({ following_id: userId, status: "active" });
    const followingCount = await Follow.countDocuments({ follower_id: userId, status: "active" });

    // Add relationship metadata if currentUserId is provided
    if (currentUserId && currentUserId !== userId) {
      const { isFollowing, isPending } = await this.checkIsFollowing(currentUserId, userId);
      const { isFollowing: followsMe } = await this.checkIsFollowing(userId, currentUserId);

      return {
        ...userObj,
        followerCount,
        followingCount,
        isFollowing,
        followsMe,
        isFollowingPending: isPending
      };
    }

    return {
      ...userObj,
      followerCount,
      followingCount
    };
  }

  async updateProfile(userId: string, updates: any) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (updates.profile) {
      user.profile = { ...user.profile, ...updates.profile };
    }
    if (updates.rig) {
      user.rig = { ...user.rig, ...updates.rig };
    }
    if (updates.is_builder !== undefined) {
      user.is_builder = updates.is_builder;
    }
    if (updates.builder_profile) {
      user.builder_profile = { ...user.builder_profile, ...updates.builder_profile };
    }

    // Handle matching_profile updates
    if (updates.matching_profile) {
      if (updates.matching_profile.intent) {
        user.matching_profile.intent = updates.matching_profile.intent;
      }
      if (updates.matching_profile.is_discoverable !== undefined) {
        user.matching_profile.is_discoverable = updates.matching_profile.is_discoverable;
      }
      if (updates.matching_profile.preferences) {
        // Explicit assignment for nested fields to ensure Mongoose change detection
        if (updates.matching_profile.preferences.min_age !== undefined) user.matching_profile.preferences.min_age = updates.matching_profile.preferences.min_age;
        if (updates.matching_profile.preferences.max_age !== undefined) user.matching_profile.preferences.max_age = updates.matching_profile.preferences.max_age;
        if (updates.matching_profile.preferences.max_distance_km !== undefined) user.matching_profile.preferences.max_distance_km = updates.matching_profile.preferences.max_distance_km;
        if (updates.matching_profile.preferences.gender_interest !== undefined) user.matching_profile.preferences.gender_interest = updates.matching_profile.preferences.gender_interest;

        user.markModified("matching_profile.preferences");
      }
    }

    await user.save();
    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async completeProfile(userId: string, profileData: any) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (profileData.profile) {
      user.profile = { ...user.profile, ...profileData.profile };
    }
    if (profileData.rig) {
      user.rig = { ...user.rig, ...profileData.rig };
    }

    await user.save();
    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async updateTravelRoute(
    userId: string,
    origin: GeospatialPoint,
    destination: GeospatialPoint,
    startDate: Date,
    durationDays: number
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.travel_route = {
      origin,
      destination,
      start_date: startDate,
      duration_days: durationDays,
    };

    await user.save();
    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async searchUsers(filters: any, pagination: { page: number; limit: number }, currentUserId?: string): Promise<{ users: any[]; total: number }> {
    const query: any = { is_active: true };

    if (currentUserId) {
      // Get IDs to exclude (blocked by me OR blocked me)
      const [blockedByMe, blockedMe] = await Promise.all([
        Block.find({ blocker_id: currentUserId }).distinct("blocked_id"),
        Block.find({ blocked_id: currentUserId }).distinct("blocker_id"),
      ]);

      const excludedIds = [...blockedByMe, ...blockedMe, currentUserId];
      query._id = { $nin: excludedIds };
    }

    if (filters.intent) {
      query["profile.intent"] = { $in: filters.intent };
    }
    if (filters.rigType) {
      query["rig.type"] = filters.rigType;
    }
    if (filters.crewType) {
      query["rig.crew_type"] = filters.crewType;
    }
    if (filters.verifiedOnly) {
      query["nomad_id.verified"] = true;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { "profile.name": searchRegex }
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const users = await User.find(query)
      .select("-password_hash")
      .skip(skip)
      .limit(pagination.limit)
      .sort({ "nomad_id.vouch_count": -1 });

    const total = await User.countDocuments(query);

    // Add relationship metadata if currentUserId is provided
    if (currentUserId) {
      const usersWithRelationship = await Promise.all(
        users.map(async (user) => {
          const userObj = user.toObject();
          if (user._id.toString() === currentUserId) {
            return userObj; // Don't add relationship metadata for self
          }

          const { isFollowing, isPending } = await this.checkIsFollowing(currentUserId, user._id.toString());
          const { isFollowing: followsMe } = await this.checkIsFollowing(user._id.toString(), currentUserId);

          return {
            ...userObj,
            isFollowing,
            followsMe,
            isFollowingPending: isPending
          };
        })
      );

      return { users: usersWithRelationship, total };
    }

    return { users, total };
  }

  async toggleBuilderStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.is_builder = !user.is_builder;
    await user.save();

    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    const following = await User.findById(followingId);
    if (!following) throw new NotFoundError("User to follow not found");

    // Check if already following
    // Dynamic import to avoid circular dependencies if any, or just import at top if possible.
    // For now assuming Follow model is imported. 
    // Wait, I need to add the import at the top using another tool call later or assume I can do it in one go.
    // I can't easily add import at top AND method at bottom in one replace_file_content unless I replace whole file.
    // I will use two tool calls or just ignore import for a second? No, typescript will fail.
    // I'll add the methods here, then add the import in next step.

    // Actually, I can use multi_replace to do both.

    const status = following.is_private ? "pending" : "active";

    // Use findOneAndUpdate with upsert to avoid race conditions/duplicates
    const follow = await Follow.findOneAndUpdate(
      { follower_id: followerId, following_id: followingId },
      {
        status,
        follower_id: followerId,
        following_id: followingId
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string) {
    await Follow.findOneAndDelete({ follower_id: followerId, following_id: followingId });
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const follows = await Follow.find({ following_id: userId, status: "active" })
      .populate("follower_id", "username profile nomad_id")
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Follow.countDocuments({ following_id: userId, status: "active" });

    return {
      followers: follows.map(f => f.follower_id),
      total,
      page,
      limit
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const follows = await Follow.find({ follower_id: userId, status: "active" })
      .populate("following_id", "username profile nomad_id")
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Follow.countDocuments({ follower_id: userId, status: "active" });

    return {
      following: follows.map(f => f.following_id),
      total,
      page,
      limit
    };
  }
  async searchTravelers(
    lat: number,
    lng: number,
    radiusInMeters: number,
    pagination: { page: number; limit: number },
    currentUserId?: string
  ): Promise<{ users: any[]; total: number }> {
    // Convert radius from meters to radians for $centerSphere
    // Earth's radius is approximately 6378100 meters
    const radiusInRadians = radiusInMeters / 6378100;

    const query: any = {
      is_active: true,
      $or: [
        {
          "travel_route.destination": {
            $geoWithin: {
              $centerSphere: [[lng, lat], radiusInRadians]
            }
          }
        },
        {
          "travel_route.origin": {
            $geoWithin: {
              $centerSphere: [[lng, lat], radiusInRadians]
            }
          }
        }
      ]
    };

    if (currentUserId) {
      // Exclude self and blocked users
      const [blockedByMe, blockedMe] = await Promise.all([
        Block.find({ blocker_id: currentUserId }).distinct("blocked_id"),
        Block.find({ blocked_id: currentUserId }).distinct("blocker_id"),
      ]);
      const excludedIds = [...blockedByMe, ...blockedMe, currentUserId];
      query._id = { $nin: excludedIds };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const users = await User.find(query)
      .select("-password_hash")
      .skip(skip)
      .limit(pagination.limit);

    const total = await User.countDocuments(query);

    // Populate relationship metadata
    if (currentUserId) {
      const usersWithRelationship = await Promise.all(
        users.map(async (user) => {
          const userObj = user.toObject();
          const { isFollowing, isPending } = await this.checkIsFollowing(currentUserId, user._id.toString());
          const { isFollowing: followsMe } = await this.checkIsFollowing(user._id.toString(), currentUserId);

          return {
            ...userObj,
            isFollowing,
            followsMe,
            isFollowingPending: isPending
          };
        })
      );
      return { users: usersWithRelationship, total };
    }

    return { users, total };
  }

  async deleteRoute(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.travel_route = undefined;
    await user.save();

    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
