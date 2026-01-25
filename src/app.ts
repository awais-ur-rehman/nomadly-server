import express, { type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
// @ts-ignore - documents folder is excluded from compilation
import { swaggerSpec } from "../documents/swagger";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/logger";
import { apiLimiter } from "./middleware/rate-limit";

import { createAuthRoutes } from "./modules/auth/routes/auth.routes";
import { createUserRoutes } from "./modules/users/routes/user.routes";
import { createMatchingRoutes } from "./modules/matching/routes/matching.routes";
import { createActivityRoutes } from "./modules/activities/routes/activity.routes";
import { createMarketplaceRoutes } from "./modules/marketplace/routes/marketplace.routes";
import { createChatRoutes } from "./modules/chat/routes/chat.routes";
import { createVouchingRoutes } from "./modules/vouching/routes/vouching.routes";
import { createPaymentRoutes } from "./modules/payments/routes/payment.routes";
import { createNotificationRoutes } from "./modules/notifications/routes/notification.routes";
import { createUploadRoutes } from "./modules/upload/routes/upload.routes";

import { AuthService } from "./modules/auth/services/auth.service";
import { UserService } from "./modules/users/services/user.service";
import { MatchingService } from "./modules/matching/services/matching.service";
import { ActivityService } from "./modules/activities/services/activity.service";
import { MarketplaceService } from "./modules/marketplace/services/marketplace.service";
import { ChatService } from "./modules/chat/services/chat.service";
import { VouchingService } from "./modules/vouching/services/vouching.service";
import { PaymentService } from "./modules/payments/services/payment.service";
import { NotificationService } from "./modules/notifications/services/notification.service";
import { UploadService } from "./modules/upload/services/upload.service";

import { AuthController } from "./modules/auth/controllers/auth.controller";
import { UserController } from "./modules/users/controllers/user.controller";
import { MatchingController } from "./modules/matching/controllers/matching.controller";
import { ActivityController } from "./modules/activities/controllers/activity.controller";
import { MarketplaceController } from "./modules/marketplace/controllers/marketplace.controller";
import { ChatController } from "./modules/chat/controllers/chat.controller";
import { VouchingController } from "./modules/vouching/controllers/vouching.controller";
import { PaymentController } from "./modules/payments/controllers/payment.controller";
import { NotificationController } from "./modules/notifications/controllers/notification.controller";
import { UploadController } from "./modules/upload/controllers/upload.controller";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(requestLogger);
  app.use(apiLimiter);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Nomadly API Documentation",
  }));

  const authService = new AuthService();
  const userService = new UserService();
  const matchingService = new MatchingService();
  const activityService = new ActivityService();
  const marketplaceService = new MarketplaceService();
  const chatService = new ChatService();
  const vouchingService = new VouchingService();
  const paymentService = new PaymentService();
  const notificationService = new NotificationService();
  const uploadService = new UploadService();

  const authController = new AuthController(authService);
  const userController = new UserController(userService);
  const matchingController = new MatchingController(matchingService);
  const activityController = new ActivityController(activityService);
  const marketplaceController = new MarketplaceController(marketplaceService);
  const chatController = new ChatController(chatService);
  const vouchingController = new VouchingController(vouchingService);
  const paymentController = new PaymentController(paymentService);
  const notificationController = new NotificationController(notificationService);
  const uploadController = new UploadController(uploadService);

  app.use("/api/auth", createAuthRoutes(authController));
  app.use("/api/users", createUserRoutes(userController));
  app.use("/api/matches", createMatchingRoutes(matchingController));
  app.use("/api/activities", createActivityRoutes(activityController));
  app.use("/api/marketplace", createMarketplaceRoutes(marketplaceController));
  app.use("/api/chat", createChatRoutes(chatController));
  app.use("/api/vouch", createVouchingRoutes(vouchingController));
  app.use("/api/payments", createPaymentRoutes(paymentController));
  app.use("/api/notifications", createNotificationRoutes(notificationController));
  app.use("/api/upload", createUploadRoutes(uploadController));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      status: "error",
      message: "Route not found",
    });
  });

  app.use(errorHandler);

  return app;
};
