import { User } from "../../users/models/user.model";
import { Match } from "../models/match.model";
import { CaravanRequest } from "../models/caravan-request.model";
import { NotFoundError } from "../../../utils/errors";
import * as turf from "@turf/turf";

export class MatchingService {
  async getDiscoveryFeed(userId: string, filters: any) {
    const user = await User.findById(userId);
    if (!user || !user.travel_route) {
      throw new NotFoundError("User or travel route not found");
    }

    const swipedUserIds = await Match.find({ user_id: userId }).distinct(
      "matched_user_id"
    );

    const query: any = {
      _id: { $ne: userId },
      is_active: true,
      travel_route: { $exists: true },
      "travel_route.origin": { $exists: true },
      "travel_route.destination": { $exists: true },
    };

    if (filters.intent) {
      query["profile.intent"] = { $in: filters.intent };
    }
    if (filters.rigType) {
      query["rig.type"] = filters.rigType;
    }
    if (filters.verifiedOnly) {
      query["nomad_id.verified"] = true;
    }

    if (swipedUserIds.length > 0) {
      query._id = { $ne: userId, $nin: swipedUserIds };
    } else {
      query._id = { $ne: userId };
    }

    const maxDistance = filters.maxDistance || 50000;

    const nearbyUsers = await User.find({
      ...query,
      "travel_route.origin": {
        $near: {
          $geometry: user.travel_route.origin,
          $maxDistance: maxDistance,
        },
      },
    }).limit(50);

    const matches = await this.calculateMatches(user, nearbyUsers);

    return matches.sort((a, b) => b.score - a.score);
  }

  private async calculateMatches(
    currentUser: any,
    potentialMatches: any[]
  ): Promise<any[]> {
    const matches = [];

    for (const user of potentialMatches) {
      if (!user.travel_route) continue;

      const intersection = this.calculateRouteIntersection(
        currentUser.travel_route,
        user.travel_route
      );

      if (!intersection) continue;

      const dateOverlap = this.checkDateOverlap(
        currentUser.travel_route,
        user.travel_route
      );

      if (!dateOverlap) continue;

      const distance = this.calculateDistance(
        currentUser.travel_route.origin,
        intersection
      );

      const hobbyScore = this.calculateHobbyScore(
        currentUser.profile.hobbies || [],
        user.profile.hobbies || []
      );

      const verificationBonus = user.nomad_id.verified ? 10 : 0;

      const score =
        100 - distance / 1000 + hobbyScore * 5 + verificationBonus;

      matches.push({
        user: {
          id: user._id,
          profile: user.profile,
          rig: user.rig,
          nomad_id: user.nomad_id,
        },
        intersection,
        distance: Math.round(distance / 1000),
        score: Math.round(score),
        commonHobbies: this.getCommonHobbies(
          currentUser.profile.hobbies || [],
          user.profile.hobbies || []
        ),
      });
    }

    return matches;
  }

  private calculateRouteIntersection(route1: any, route2: any): any | null {
    try {
      const line1 = turf.lineString([
        route1.origin.coordinates,
        route1.destination.coordinates,
      ]);
      const line2 = turf.lineString([
        route2.origin.coordinates,
        route2.destination.coordinates,
      ]);

      const intersection = turf.lineIntersect(line1, line2);

      if (intersection.features.length > 0) {
        const point = intersection.features[0].geometry.coordinates;
        return {
          type: "Point",
          coordinates: point,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private checkDateOverlap(route1: any, route2: any): boolean {
    const start1 = new Date(route1.start_date);
    const end1 = new Date(
      start1.getTime() + route1.duration_days * 24 * 60 * 60 * 1000
    );
    const start2 = new Date(route2.start_date);
    const end2 = new Date(
      start2.getTime() + route2.duration_days * 24 * 60 * 60 * 1000
    );

    return start1 <= end2 && start2 <= end1;
  }

  private calculateDistance(point1: any, point2: any): number {
    const from = turf.point(point1.coordinates);
    const to = turf.point(point2.coordinates);
    return turf.distance(from, to, { units: "meters" });
  }

  private calculateHobbyScore(hobbies1: string[], hobbies2: string[]): number {
    const common = hobbies1.filter((h) => hobbies2.includes(h));
    return common.length;
  }

  private getCommonHobbies(hobbies1: string[], hobbies2: string[]): string[] {
    return hobbies1.filter((h) => hobbies2.includes(h));
  }

  async swipe(userId: string, matchedUserId: string, action: "left" | "right" | "star") {
    const existingMatch = await Match.findOne({
      user_id: userId,
      matched_user_id: matchedUserId,
    });

    if (existingMatch) {
      existingMatch.swipe_action = action;
      await existingMatch.save();
      return existingMatch;
    }

    const match = await Match.create({
      user_id: userId,
      matched_user_id: matchedUserId,
      swipe_action: action,
    });

    if (action === "right" || action === "star") {
      const mutualMatch = await Match.findOne({
        user_id: matchedUserId,
        matched_user_id: userId,
        swipe_action: { $in: ["right", "star"] },
      });

      if (mutualMatch) {
        match.is_mutual = true;
        mutualMatch.is_mutual = true;
        await match.save();
        await mutualMatch.save();
      }
    }

    if (action === "star") {
      await CaravanRequest.findOneAndUpdate(
        {
          requester_id: userId,
          target_user_id: matchedUserId,
        },
        {
          requester_id: userId,
          target_user_id: matchedUserId,
          status: "pending",
        },
        { upsert: true, new: true }
      );
    }

    return match;
  }

  async getMutualMatches(userId: string) {
    const matches = await Match.find({
      user_id: userId,
      is_mutual: true,
    }).populate("matched_user_id", "profile rig nomad_id");

    return matches.map((match) => ({
      matchId: match._id,
      user: match.matched_user_id,
      createdAt: match.created_at,
    }));
  }
}
