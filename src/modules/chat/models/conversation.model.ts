import { Schema, model, type Document } from "mongoose";

interface IConversation extends Document {
  participants: string[];
  type: "direct" | "group";
  last_message?: string;
  last_message_time?: Date;
  created_at: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    last_message: { type: String },
    last_message_time: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ last_message_time: -1 });

export const Conversation = model<IConversation>("Conversation", conversationSchema);
