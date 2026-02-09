import { type Request, type Response } from "express";
import { SafetyService } from "../services/safety.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class SafetyController {
  constructor(private safetyService: SafetyService) {}

  // ─── BLOCK ENDPOINTS ───────────────────────────────────────────────

  blockUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { userId } = req.params;
    const result = await this.safetyService.blockUser(req.user.userId, userId);
    ApiResponse.success(res, result, "User blocked successfully", 201);
  });

  unblockUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { userId } = req.params;
    const result = await this.safetyService.unblockUser(req.user.userId, userId);
    ApiResponse.success(res, result, "User unblocked successfully");
  });

  getBlockedUsers = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const blockedUsers = await this.safetyService.getBlockedUsers(req.user.userId);
    ApiResponse.success(res, blockedUsers);
  });

  // ─── REPORT ENDPOINTS ──────────────────────────────────────────────

  reportUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { userId } = req.params;
    const { reason, description } = req.body;
    const result = await this.safetyService.reportUser(
      req.user.userId,
      userId,
      reason,
      description
    );
    ApiResponse.success(res, result, "Report submitted successfully", 201);
  });

  // ─── ADMIN ENDPOINTS ───────────────────────────────────────────────

  getReports = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { status, page, limit } = req.query;
    const result = await this.safetyService.getReports(
      status as string,
      Number(page) || 1,
      Number(limit) || 20
    );
    ApiResponse.success(res, result);
  });

  resolveReport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { reportId } = req.params;
    const { action, admin_notes } = req.body;
    const result = await this.safetyService.resolveReport(
      reportId,
      req.user.userId,
      action,
      admin_notes
    );
    ApiResponse.success(res, result, "Report resolved");
  });

  suspendUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { userId } = req.params;
    const result = await this.safetyService.suspendUser(req.user.userId, userId);
    ApiResponse.success(res, result, "User suspended");
  });
}
