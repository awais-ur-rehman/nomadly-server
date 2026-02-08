import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../../../middleware/auth";

const router = Router();

export const createNotificationRoutes = (
  notificationController: NotificationController
) => {
  // Get all notifications (paginated)
  router.get("/", authenticate, notificationController.getMyNotifications);

  // Get unread count
  router.get("/unread-count", authenticate, notificationController.getUnreadCount);

  // Mark single notification as read
  router.patch("/:id/read", authenticate, notificationController.markAsRead);

  // Mark all notifications as read
  router.post("/mark-all-read", authenticate, notificationController.markAllAsRead);

  // Test endpoint (dev only)
  router.post("/test", authenticate, notificationController.sendTest);

  return router;
};
