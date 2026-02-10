import { type Request, type Response } from "express";
import { PaymentService } from "../services/payment.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  webhook = asyncHandler(async (req: Request, res: Response) => {
    await this.paymentService.handleRevenueCatWebhook(req.body);
    res.status(200).send("OK");
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const status = await this.paymentService.getSubscriptionStatus(req.user.userId);
    ApiResponse.success(res, status);
  });

  sync = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const status = await this.paymentService.syncSubscription(req.user.userId);
    ApiResponse.success(res, status);
  });
}
