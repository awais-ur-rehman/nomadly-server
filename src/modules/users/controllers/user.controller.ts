import { type Request, type Response } from "express";
import { UserService } from "../services/user.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class UserController {
  constructor(private userService: UserService) {}

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
      coordinates: [origin.lng, origin.lat],
    };
    const destinationPoint = {
      type: "Point" as const,
      coordinates: [destination.lng, destination.lat],
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
    });

    ApiResponse.paginated(res, users, page, limit, total);
  });

  toggleBuilderStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const user = await this.userService.toggleBuilderStatus(req.user.userId);
    ApiResponse.success(res, user, "Builder status updated successfully");
  });
}
