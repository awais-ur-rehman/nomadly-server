import { type Request, type Response } from "express";
import { AiService } from "../services/ai.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class AiController {
    constructor(private aiService: AiService) { }

    chat = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new Error("User not authenticated");
        }

        const { message, history } = req.body;
        if (!message) {
            throw new Error("Message is required");
        }

        try {
            const { text, usage } = await this.aiService.chat(req.user.userId, message, history);
            return ApiResponse.success(res, { response: text, usage });
        } catch (error: any) {
            if (error.message === "RATE_LIMIT_EXCEEDED") {
                return res.status(429).json({
                    success: false,
                    message: "You've reached your daily Nomi limit.",
                    code: "RATE_LIMIT_EXCEEDED"
                });
            }
            throw error;
        }
    });

    getQuota = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new Error("User not authenticated");
        }

        const quota = await this.aiService.getQuota(req.user.userId);
        return ApiResponse.success(res, { usage: quota });
    });
}
