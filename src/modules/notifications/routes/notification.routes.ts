import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../../../middleware/auth";

const router = Router();

export const createNotificationRoutes = (
  notificationController: NotificationController
) => {
  router.get("/", authenticate, notificationController.getMyNotifications);
  router.post("/test", authenticate, notificationController.sendTest);

  return router;
};
