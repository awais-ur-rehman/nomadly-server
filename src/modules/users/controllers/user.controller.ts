import { type Request, type Response } from "express";
import { UserService } from "../services/user.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";
import { logger } from "../../../utils/logger";

export class UserController {
  constructor(private userService: UserService) { }

  getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const user = await this.userService.getUserById(req.user.userId);
    ApiResponse.success(res, user);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const user = await this.userService.updateProfile(req.user.userId, req.body);
    ApiResponse.success(res, user, "Profile updated successfully");
  });

  completeProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const user = await this.userService.completeProfile(req.user.userId, req.body);
    ApiResponse.success(res, user, "Profile completed successfully");
  });

  updateRoute = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const { origin, destination, start_date, duration_days } = req.body;

    const originPoint = {
      type: "Point" as const,
      coordinates: [origin.lng, origin.lat] as [number, number],
    };
    const destinationPoint = {
      type: "Point" as const,
      coordinates: [destination.lng, destination.lat] as [number, number],
    };

    const user = await this.userService.updateTravelRoute(
      req.user.userId,
      originPoint,
      destinationPoint,
      new Date(start_date),
      duration_days
    );
    ApiResponse.success(res, user, "Travel route updated successfully");
  });

  searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      search: (req.query.search || req.query.q) as string | undefined,
      intent: req.query.intent ? (req.query.intent as string).split(",") : undefined,
      rigType: req.query.rig_type as string | undefined,
      crewType: req.query.crew_type as string | undefined,
      verifiedOnly: req.query.verified_only === "true",
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { users, total } = await this.userService.searchUsers(filters, {
      page,
      limit,
    }, req.user?.userId); // Pass currentUserId for relationship metadata

    // RICH DEBUG LOGGING FOR USER
    logger.info({
      filters,
      resultsCount: users.length,
      total,
      matchedUsernames: users.map(u => u.username)
    }, "Search results returned to app");

    ApiResponse.paginated(res, users, page, limit, total);
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await this.userService.getUserById(userId, req.user?.userId);
    ApiResponse.success(res, user);
  });

  toggleBuilderStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const user = await this.userService.toggleBuilderStatus(req.user.userId);
    ApiResponse.success(res, user, "Builder status updated successfully");
  });

  followUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const { userId } = req.params;
    const result = await this.userService.followUser(req.user.userId, userId);
    ApiResponse.success(res, result, "User followed successfully");
  });

  unfollowUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const { userId } = req.params;
    await this.userService.unfollowUser(req.user.userId, userId);
    ApiResponse.success(res, null, "User unfollowed successfully");
  });

  getFollowers = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.userService.getFollowers(userId, page, limit);
    ApiResponse.paginated(res, result.followers, page, limit, result.total);
  });

  getFollowing = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.userService.getFollowing(userId, page, limit);
    ApiResponse.paginated(res, result.following, page, limit, result.total);
  });
  getTravelers = asyncHandler(async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 50000; // 50km default
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Latitude and longitude are required");
    }

    const result = await this.userService.searchTravelers(
      lat,
      lng,
      radius,
      { page, limit },
      req.user?.userId
    );
    ApiResponse.paginated(res, result.users, page, limit, result.total);
  });

  deleteRoute = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const user = await this.userService.deleteRoute(req.user.userId);
    ApiResponse.success(res, user, "Travel route deleted successfully");
  });
}
