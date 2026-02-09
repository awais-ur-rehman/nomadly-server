import { type Request, type Response } from "express";
import { InviteService } from "../services/invite.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class InviteController {
  constructor(private inviteService: InviteService) {}

  generateCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { max_uses } = req.body;
    const result = await this.inviteService.generateCode(req.user.userId, max_uses);
    ApiResponse.success(res, result, "Invite code generated", 201);
  });

  getMyCodes = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const codes = await this.inviteService.getMyCodes(req.user.userId);
    ApiResponse.success(res, codes);
  });

  revokeCode = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const { codeId } = req.params;
    const result = await this.inviteService.revokeCode(req.user.userId, codeId);
    ApiResponse.success(res, result, "Invite code revoked");
  });

  validateCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    await this.inviteService.validateCode(code);
    ApiResponse.success(res, { valid: true }, "Invite code is valid");
  });

  getInviteTree = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new Error("User not authenticated");
    const tree = await this.inviteService.getInviteTree(req.user.userId);
    ApiResponse.success(res, tree);
  });
}
