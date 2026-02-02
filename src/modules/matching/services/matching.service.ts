import { User, type IUser } from "../../users/models/user.model";
import { Match } from "../models/match.model";
import { Swipe } from "../models/swipe.model";
import { Conversation } from "../../chat/models/conversation.model";
import { Block } from "../../safety/models/block.model";
import { NotFoundError, ForbiddenError } from "../../../utils/errors";
import { io } from "../../../server"; // Import socket instance
import { rankCandidates } from "./scoring.engine";

export class MatchingService {
  /**
   * Update user's matching preferences
   */
  async updatePreferences(userId: string, data: any) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (data.intent) user.matching_profile.intent = data.intent;

    if (data.preferences) {
      // Direct assignment needed for Mongoose to detect changes in nested fields
      if (data.preferences.min_age !== undefined) user.matching_profile.preferences.min_age = data.preferences.min_age;
      if (data.preferences.max_age !== undefined) user.matching_profile.preferences.max_age = data.preferences.max_age;
      if (data.preferences.max_distance_km !== undefined) user.matching_profile.preferences.max_distance_km = data.preferences.max_distance_km;
      if (data.preferences.gender_interest !== undefined) user.matching_profile.preferences.gender_interest = data.preferences.gender_interest;

      // Explicitly mark as modified just in case
      user.markModified("matching_profile.preferences");
    }

    if (data.is_discoverable !== undefined) {
      user.matching_profile.is_discoverable = data.is_discoverable;
    }

    await user.save();
    return user.matching_profile;
  }

  /**
   * Get recommendations (Discovery Feed) — Smart Matching Algorithm
   *
   * Strategy:
   * 1. Fetch a broad candidate pool using basic filters (exclude self, swiped, blocked)
   * 2. Score every candidate on 6 dimensions (route, temporal, hobby, proximity, trust, rig)
   * 3. Rank by weighted composite score
   * 4. Paginate the ranked results
   */
  async getRecommendations(
    userId: string,
    page: number = 1,
    limit: number = 10,
    mode?: "friends" | "dating" | "both"
  ) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Determine matching mode from param or user's profile intent
    const matchMode = mode || user.matching_profile.intent || "both";

    // Get IDs to exclude (swiped + blocked)
    const [swipedUserIds, blockedByMe, blockedMe] = await Promise.all([
      Swipe.find({ actor_id: userId }).distinct("target_id"),
      Block.find({ blocker_id: userId }).distinct("blocked_id"),
      Block.find({ blocked_id: userId }).distinct("blocker_id"),
    ]);
    const excludedIds = [...swipedUserIds, ...blockedByMe, ...blockedMe];

    // Build broad candidate query — only hard filters, scoring handles the rest
    const query: any = {
      _id: { $ne: userId, $nin: excludedIds },
      is_active: true,
      "matching_profile.is_discoverable": true,
    };

    // Intent compatibility filter
    if (matchMode !== "both") {
      query["matching_profile.intent"] = { $in: [matchMode, "both"] };
    }

    // Age filter (hard constraint — don't show people outside preference)
    const { min_age, max_age } = user.matching_profile.preferences;
    if (min_age || max_age) {
      query["profile.age"] = {};
      if (min_age) query["profile.age"].$gte = min_age;
      if (max_age) query["profile.age"].$lte = max_age;
    }

    // Fetch a broad candidate pool (up to 200) for scoring
    // We need all route, hobby, rig, and trust fields for the scoring engine
    const CANDIDATE_POOL_SIZE = 200;
    const candidates = await User.find(query)
      .select("username profile rig travel_route nomad_id matching_profile")
      .limit(CANDIDATE_POOL_SIZE);

    // Score and rank all candidates using the smart matching algorithm
    const ranked = rankCandidates(
      user as IUser,
      candidates as IUser[],
      matchMode as "friends" | "dating" | "both"
    );

    // Paginate the ranked results
    const startIndex = (page - 1) * limit;
    const paginatedResults = ranked.slice(startIndex, startIndex + limit);

    // Map to response format with score breakdown
    return paginatedResults.map((entry) => ({
      _id: entry.user._id,
      username: entry.user.username,
      profile: entry.user.profile,
      rig: entry.user.rig,
      nomad_id: entry.user.nomad_id,
      travel_route: {
        destination: entry.user.travel_route?.destination,
        start_date: entry.user.travel_route?.start_date,
        duration_days: entry.user.travel_route?.duration_days,
      },
      distance_km: entry.distance_km,
      compatibility: entry.score,
    }));
  }

  /**
   * Record a swipe action
   */
  async swipe(actorId: string, targetUserId: string, action: "like" | "pass" | "super_like") {
    console.log(`DEBUG: Swipe - Actor: ${actorId}, Target: ${targetUserId}, Action: ${action}`);

    // Check if either user has blocked the other
    const blocked = await Block.findOne({
      $or: [
        { blocker_id: actorId, blocked_id: targetUserId },
        { blocker_id: targetUserId, blocked_id: actorId },
      ],
    });
    if (blocked) {
      throw new ForbiddenError("Cannot interact with this user");
    }

    // 1. Record the swipe
    await Swipe.create({
      actor_id: actorId,
      target_id: targetUserId,
      action
    });

    // If pass, just return
    if (action === "pass") {
      return { isMatch: false };
    }

    // If like/super_like, check for mutual match
    const reciprocalSwipe = await Swipe.findOne({
      actor_id: targetUserId,
      target_id: actorId,
      action: { $in: ["like", "super_like"] }
    });

    if (reciprocalSwipe) {
      console.log(`DEBUG: IT'S A MATCH! - Users: ${actorId} & ${targetUserId}`);

      // IT'S A MATCH! 🎉

      // 1. Create Conversation
      const conversation = await Conversation.create({
        participants: [actorId, targetUserId],
        type: "direct", // or "match" if supported
        last_message: "New Match! Say hi 👋",
        last_message_time: new Date()
      });
      console.log(`DEBUG: Conversation Created - ID: ${conversation._id}`);

      // 2. Create Match record
      const match = await Match.create({
        users: [actorId, targetUserId].sort(), // Sort for consistent querying
        initiated_by: actorId,
        conversation_id: conversation._id
      });
      console.log(`DEBUG: Match Record Created - ID: ${match._id}`);

      // 3. Get User Details for response
      const matchedUser = await User.findById(targetUserId)
        .select("username profile.name profile.photo_url");

      // 4. Emit Socket Event to the OTHER user (targetUserId)
      const actorUser = await User.findById(actorId).select("username profile.name profile.photo_url");

      if (io) {
        io.to(targetUserId).emit("match_new", {
          match_id: match._id,
          conversation_id: conversation._id,
          partner: actorUser
        });
      }

      return {
        isMatch: true,
        match: {
          _id: match._id,
          conversation_id: conversation._id,
          user: matchedUser
        }
      };
    }

    return { isMatch: false };
  }

  /**
   * Get list of matches
   */
  async getMatches(userId: string) {
    console.log(`DEBUG: getMatches - Fetching matches for user: ${userId}`);

    const matches = await Match.find({
      users: userId
    })
      .sort({ created_at: -1 })
      .populate("conversation_id");

    console.log(`DEBUG: getMatches - Found ${matches.length} matches`);

    // Populate the OTHER user in the match
    const populatedMatches = await Promise.all(matches.map(async (match) => {
      const otherUserId = match.users.find(id => id.toString() !== userId);
      const otherUser = await User.findById(otherUserId).select("username profile.name profile.photo_url nomad_id");

      return {
        _id: match._id, // User expects _id
        userId: userId,
        matchedUserId: otherUserId,
        matchedUser: otherUser, // User expects matchedUser
        conversation_id: match.conversation_id,
        createdAt: match.created_at // User expects createdAt
      };
    }));

    return populatedMatches;
  }
}
