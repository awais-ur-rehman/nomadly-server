import { Router } from "express";
import { z } from "zod";
import { ChatController } from "../controllers/chat.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";
import { chatLimiter } from "../../../middleware/rate-limit";

const router = Router();

const createMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1),
    message_type: z.enum(["text", "image", "location"]).optional(),
  }),
});

export const createChatRoutes = (chatController: ChatController) => {
  router.get("/conversations", authenticate, chatController.getConversations);
  router.post("/conversations", authenticate, chatController.createConversation);
  router.get(
    "/:conversationId/messages",
    authenticate,
    chatController.getMessages
  );
  router.post(
    "/:conversationId/messages",
    authenticate,
    chatLimiter,
    validate(createMessageSchema),
    chatController.createMessage
  );
  router.get(
    "/conversation/:userId",
    authenticate,
    chatController.getOrCreateConversation
  );
  router.patch(
    "/:conversationId/read",
    authenticate,
    chatController.markAsRead
  );

  // Aliases for frontend compatibility (matches standard REST nested resources)
  router.get(
    "/conversations/:conversationId/messages",
    authenticate,
    chatController.getMessages
  );
  router.post(
    "/conversations/:conversationId/messages",
    authenticate,
    chatLimiter,
    validate(createMessageSchema),
    chatController.createMessage
  );
  router.patch(
    "/conversations/:conversationId/read",
    authenticate,
    chatController.markAsRead
  );

  return router;
};
