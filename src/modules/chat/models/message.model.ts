import { Schema, model, type Document } from "mongoose";

interface IMessage extends Document {
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: "text" | "image" | "location";
  read_by: string[];
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation_id: {
      type: Schema.Types.ObjectId as any,
      required: true,
      ref: "Conversation",
    },
    sender_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    message: { type: String, required: true },
    message_type: {
      type: String,
      enum: ["text", "image", "location"],
      default: "text",
    },
    read_by: [{ type: Schema.Types.ObjectId as any, ref: "User" }],
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false },
  }
);

messageSchema.index({ conversation_id: 1, timestamp: -1 });
messageSchema.index({ sender_id: 1 });

export const Message = model<IMessage>("Message", messageSchema);
