import { type Request, type Response } from "express";
import { MatchingService } from "../services/matching.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class MatchingController {
  constructor(private matchingService: MatchingService) { }

  updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const preferences = await this.matchingService.updatePreferences(req.user.userId, req.body);
    ApiResponse.success(res, preferences, "Preferences updated");
  });

  getRecommendations = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const mode = req.query.mode as "friends" | "dating" | "both" | undefined;

    const recommendations = await this.matchingService.getRecommendations(
      req.user.userId,
      page,
      limit,
      mode
    );
    ApiResponse.success(res, { users: recommendations });
  });

  // Keep for backward compatibility if needed, maps to getRecommendations
  getDiscovery = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const mode = req.query.mode as "friends" | "dating" | "both" | undefined;

    const recommendations = await this.matchingService.getRecommendations(
      req.user.userId,
      page,
      limit,
      mode
    );
    ApiResponse.success(res, { users: recommendations });
  });

  swipe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");

    const { targetUserId, action } = req.body;
    // Handle both field names for backward compatibility (matched_user_id vs targetUserId)
    const targetId = targetUserId || req.body.matched_user_id;

    const result = await this.matchingService.swipe(
      req.user.userId,
      targetId,
      action
    );
    ApiResponse.success(res, result);
  });

  getMatches = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");

    const matches = await this.matchingService.getMatches(req.user.userId);
    ApiResponse.success(res, { matches });
  });

  // Alias for backward compatibility
  getMutualMatches = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const matches = await this.matchingService.getMatches(req.user.userId);
    ApiResponse.success(res, { matches });
  });

  /**
   * Caravan Joining
   */

  sendCaravanRequest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { targetUserId } = req.body;

    const request = await this.matchingService.sendCaravanRequest(req.user.userId, targetUserId);
    ApiResponse.success(res, request, "Caravan request sent", 201);
  });

  respondToCaravanRequest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await this.matchingService.respondToCaravanRequest(requestId, req.user.userId, status);
    ApiResponse.success(res, request, "Response recorded");
  });

  getCaravanRequests = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const type = (req.query.type as "incoming" | "outgoing") || "incoming";

    const requests = await this.matchingService.getCaravanRequests(req.user.userId, type);
    ApiResponse.success(res, { requests });
  });
}
