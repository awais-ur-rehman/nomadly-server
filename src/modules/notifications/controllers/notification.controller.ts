import { type Request, type Response } from "express";
import { NotificationService } from "../services/notification.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  sendTest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { title, body } = req.body;
    await this.notificationService.sendPushNotification(
      req.user.userId,
      title,
      body
    );
    ApiResponse.success(res, null, "Notification sent");
  });
}
