import { type Request, type Response } from "express";
import { VouchingService } from "../services/vouching.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class VouchingController {
  constructor(private vouchingService: VouchingService) {}

  createVouch = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { userId } = req.params;
    const vouch = await this.vouchingService.createVouch(req.user.userId, userId);
    ApiResponse.success(res, vouch, "Vouch created successfully", 201);
  });

  getReceivedVouches = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const vouches = await this.vouchingService.getReceivedVouches(req.user.userId);
    ApiResponse.success(res, vouches);
  });
}
