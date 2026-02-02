import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { Block } from "../../safety/models/block.model";
import { NotFoundError, ForbiddenError } from "../../../utils/errors";

export class ChatService {
  async getConversations(userId: string): Promise<any[]> {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "profile")
      .sort({ last_message_time: -1 });

    return conversations;
  }

  async getMessages(conversationId: string, userId: string, pagination: any): Promise<{ messages: any[]; total: number }> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    if (!conversation.participants.includes(userId as any)) {
      throw new NotFoundError("Not a participant in this conversation");
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const messages = await Message.find({ conversation_id: conversationId })
      .populate("sender_id", "profile")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .sort({ timestamp: 1 });

    const total = await Message.countDocuments({ conversation_id: conversationId });

    return { messages, total };
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    message: string,
    messageType: "text" | "image" | "location" = "text"
  ): Promise<any> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    // Check if either participant has blocked the other
    const otherUserId = conversation.participants.find(
      (p: any) => p.toString() !== senderId
    );
    if (otherUserId) {
      const blocked = await Block.findOne({
        $or: [
          { blocker_id: senderId, blocked_id: otherUserId },
          { blocker_id: otherUserId, blocked_id: senderId },
        ],
      });
      if (blocked) {
        throw new ForbiddenError("Cannot send messages in this conversation");
      }
    }

    const newMessage = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      message,
      message_type: messageType,
      read_by: [senderId],
    });

    conversation.last_message = message;
    conversation.last_message_time = new Date();
    await conversation.save();

    return newMessage;
  }

  async getOrCreateConversation(userId1: string, userId2: string): Promise<any> {
    // Check if either user has blocked the other
    const blocked = await Block.findOne({
      $or: [
        { blocker_id: userId1, blocked_id: userId2 },
        { blocker_id: userId2, blocked_id: userId1 },
      ],
    });
    if (blocked) {
      throw new ForbiddenError("Cannot start a conversation with this user");
    }

    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [userId1, userId2] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId1, userId2],
        type: "direct",
      });
    }

    // Populate participants before returning
    await conversation.populate("participants", "profile username photo_url");

    return conversation;
  }

  async markAsRead(conversationId: string, userId: string) {
    await Message.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        read_by: { $ne: userId },
      },
      {
        $addToSet: { read_by: userId },
      }
    );
  }
}
