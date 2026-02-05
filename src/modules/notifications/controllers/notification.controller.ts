import { type Request, type Response } from "express";
import { NotificationService } from "../services/notification.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class NotificationController {
  constructor(private notificationService: NotificationService) { }

  getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { page = 1, limit = 20 } = req.query;
    const notifications = await this.notificationService.getUserNotifications(
      req.user.userId,
      Number(page),
      Number(limit)
    );

    ApiResponse.success(res, notifications, "Notifications retrieved");
  });

  sendTest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { title, body } = req.body;
    await this.notificationService.sendPushNotification(
      req.user.userId,
      title,
      body,
      "system"
    );
    ApiResponse.success(res, null, "Notification sent");
  });
}
