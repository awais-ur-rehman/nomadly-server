import { type Request, type Response } from "express";
import { MatchingService } from "../services/matching.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  getDiscovery = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const filters = {
      intent: req.query.intent ? (req.query.intent as string).split(",") : undefined,
      rigType: req.query.rig_type as string | undefined,
      verifiedOnly: req.query.verified_only === "true",
      maxDistance: req.query.max_distance
        ? parseInt(req.query.max_distance as string)
        : undefined,
    };

    const matches = await this.matchingService.getDiscoveryFeed(
      req.user.userId,
      filters
    );
    ApiResponse.success(res, matches);
  });

  swipe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { matched_user_id, action } = req.body;
    const match = await this.matchingService.swipe(
      req.user.userId,
      matched_user_id,
      action
    );
    ApiResponse.success(res, match, "Swipe recorded");
  });

  getMutualMatches = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const matches = await this.matchingService.getMutualMatches(req.user.userId);
    ApiResponse.success(res, matches);
  });
}
