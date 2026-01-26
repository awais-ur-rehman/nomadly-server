import { User } from "../../users/models/user.model";
import { Match } from "../models/match.model";
import { Swipe } from "../models/swipe.model";
import { Conversation } from "../../chat/models/conversation.model";
import { NotFoundError } from "../../../utils/errors";
import { io } from "../../../server"; // Import socket instance
import * as turf from "@turf/turf";

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
   * Get recommendations (Discovery Feed)
   */
  async getRecommendations(userId: string, page: number = 1, limit: number = 10) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Get IDs of users already swiped on
    const swipedUserIds = await Swipe.find({ actor_id: userId }).distinct("target_id");

    // Build query based on preferences
    const query: any = {
      _id: { $ne: userId, $nin: swipedUserIds }, // Exclude self and swiped users
      "matching_profile.is_discoverable": true, // Only show discoverable users
    };

    // Filter by Intent
    if (user.matching_profile.intent !== "both") {
      query["matching_profile.intent"] = { $in: [user.matching_profile.intent, "both"] };
    }

    // Filter by Age
    const { min_age, max_age, max_distance_km } = user.matching_profile.preferences;
    if (min_age || max_age) {
      query["profile.age"] = {};
      if (min_age) query["profile.age"].$gte = min_age;
      if (max_age) query["profile.age"].$lte = max_age;
    }

    console.log("DEBUG: Matching - User Profile:", {
      id: user._id,
      coords: user.travel_route?.origin?.coordinates,
      pref: user.matching_profile
    });

    // Filter by Location (if user has location)
    // Filter by Location (if user has location)
    if (user.travel_route?.origin?.coordinates && max_distance_km > 0) {
      query["travel_route.origin"] = {
        $near: {
          $geometry: user.travel_route.origin,
          $maxDistance: max_distance_km * 1000, // Convert km to meters
        },
      };
    } else {
      console.log("DEBUG: Matching - Location filter skipped (missing coords or distance=0)");
    }

    console.log("DEBUG: Matching - Final Query:", JSON.stringify(query, null, 2));

    const users = await User.find(query)
      .select("profile rig nomad_id travel_route.origin") // Select only needed fields
      .limit(limit)
      .skip((page - 1) * limit);

    // Map to simple response format
    return users.map(u => {
      // Calculate distance if possible
      let distance_km = null;
      if (user.travel_route?.origin && u.travel_route?.origin) {
        const from = turf.point(user.travel_route.origin.coordinates);
        const to = turf.point(u.travel_route.origin.coordinates);
        distance_km = Math.round(turf.distance(from, to, { units: "kilometers" }));
      }

      return {
        _id: u._id,
        username: u.username,
        profile: u.profile,
        nomad_id: u.nomad_id,
        distance_km
      };
    });
  }

  /**
   * Record a swipe action
   */
  async swipe(actorId: string, targetUserId: string, action: "like" | "pass" | "super_like") {
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
      // IT'S A MATCH! 🎉

      // 1. Create Conversation
      const conversation = await Conversation.create({
        participants: [actorId, targetUserId],
        type: "direct", // or "match" if supported
        last_message: "New Match! Say hi 👋",
        last_message_time: new Date()
      });

      // 2. Create Match record
      const match = await Match.create({
        users: [actorId, targetUserId].sort(), // Sort for consistent querying
        initiated_by: actorId,
        conversation_id: conversation._id
      });

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
    const matches = await Match.find({
      users: userId
    })
      .sort({ created_at: -1 })
      .populate("conversation_id");

    // Populate the OTHER user in the match
    const populatedMatches = await Promise.all(matches.map(async (match) => {
      const otherUserId = match.users.find(id => id.toString() !== userId);
      const otherUser = await User.findById(otherUserId).select("username profile.name profile.photo_url nomad_id");

      return {
        matchId: match._id,
        conversation_id: match.conversation_id,
        user: otherUser,
        matchedAt: match.created_at
      };
    }));

    return populatedMatches;
  }
}
