import { type Request, type Response } from "express";
import { VerificationService } from "../services/verification.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  // ─── USER ENDPOINTS ───────────────────────────────────────────────

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const status = await this.verificationService.getVerificationStatus(req.user.userId);
    ApiResponse.success(res, status);
  });

  submitPhone = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { phone_number } = req.body;
    const result = await this.verificationService.submitPhone(req.user.userId, phone_number);
    ApiResponse.success(res, result, "Phone number submitted", 201);
  });

  submitPhoto = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { selfie_url } = req.body;
    const result = await this.verificationService.submitPhotoVerification(req.user.userId, selfie_url);
    ApiResponse.success(res, result, "Selfie submitted for review", 201);
  });

  submitIdDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { document_url, document_type } = req.body;
    const result = await this.verificationService.submitIdDocument(
      req.user.userId,
      document_url,
      document_type
    );
    ApiResponse.success(res, result, "ID document submitted for review", 201);
  });

  refreshCommunity = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const result = await this.verificationService.refreshCommunityStatus(req.user.userId);
    ApiResponse.success(res, result);
  });

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────────

  getPending = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const type = req.query.type as "phone" | "photo" | "id_document" | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await this.verificationService.getPendingVerifications(type, page, limit);
    ApiResponse.success(res, result);
  });

  reviewPhone = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { userId } = req.params;
    const { action } = req.body;
    const result = await this.verificationService.adminReviewPhone(req.user.userId, userId, action);
    ApiResponse.success(res, result);
  });

  reviewPhoto = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { userId } = req.params;
    const { action, rejection_reason } = req.body;
    const result = await this.verificationService.adminReviewPhoto(
      req.user.userId,
      userId,
      action,
      rejection_reason
    );
    ApiResponse.success(res, result);
  });

  reviewIdDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { userId } = req.params;
    const { action, rejection_reason } = req.body;
    const result = await this.verificationService.adminReviewIdDocument(
      req.user.userId,
      userId,
      action,
      rejection_reason
    );
    ApiResponse.success(res, result);
  });
}
