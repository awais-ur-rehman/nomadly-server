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
    const result = await this.notificationService.getUserNotifications(
      req.user.userId,
      Number(page),
      Number(limit)
    );

    ApiResponse.success(res, result, "Notifications retrieved");
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const count = await this.notificationService.getUnreadCount(req.user.userId);
    ApiResponse.success(res, { count }, "Unread count retrieved");
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const notification = await this.notificationService.markAsRead(id, req.user.userId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    ApiResponse.success(res, notification, "Notification marked as read");
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    await this.notificationService.markAllAsRead(req.user.userId);
    ApiResponse.success(res, null, "All notifications marked as read");
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
