import { Router } from "express";
import { z } from "zod";
import { ChatController } from "../controllers/chat.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const createMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1),
    message_type: z.enum(["text", "image", "location"]).optional(),
  }),
});

export const createChatRoutes = (chatController: ChatController) => {
  router.get("/conversations", authenticate, chatController.getConversations);
  router.get(
    "/:conversationId/messages",
    authenticate,
    chatController.getMessages
  );
  router.post(
    "/:conversationId/messages",
    authenticate,
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

  return router;
};
