import { type Request, type Response } from "express";
import { ChatService } from "../services/chat.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class ChatController {
  constructor(private chatService: ChatService) {}

  getConversations = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const conversations = await this.chatService.getConversations(req.user.userId);
    ApiResponse.success(res, conversations);
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const { messages, total } = await this.chatService.getMessages(
      conversationId,
      req.user.userId,
      { page, limit }
    );

    ApiResponse.paginated(res, messages, page, limit, total);
  });

  createMessage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { conversationId } = req.params;
    const { message, message_type } = req.body;

    const newMessage = await this.chatService.createMessage(
      conversationId,
      req.user.userId,
      message,
      message_type || "text"
    );

    ApiResponse.success(res, newMessage, "Message sent", 201);
  });

  getOrCreateConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { userId } = req.params;
    const conversation = await this.chatService.getOrCreateConversation(
      req.user.userId,
      userId
    );

    ApiResponse.success(res, conversation);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { conversationId } = req.params;
    await this.chatService.markAsRead(conversationId, req.user.userId);
    ApiResponse.success(res, null, "Messages marked as read");
  });
}
