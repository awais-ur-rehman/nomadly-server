import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { NotFoundError } from "../../../utils/errors";

export class ChatService {
  async getConversations(userId: string) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "profile")
      .sort({ last_message_time: -1 });

    return conversations;
  }

  async getMessages(conversationId: string, userId: string, pagination: any) {
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
  ) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError("Conversation not found");
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

  async getOrCreateConversation(userId1: string, userId2: string) {
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
