import { Schema, model, type Document } from "mongoose";

interface IMatch extends Document {
  users: string[];
  user1: string;  // First user (alphabetically sorted ObjectId)
  user2: string;  // Second user (alphabetically sorted ObjectId)
  initiated_by: string;
  conversation_id: string;
  created_at: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    users: [{ type: Schema.Types.ObjectId as any, ref: "User", required: true }],
    // Separate fields for unique constraint - stored in sorted order
    user1: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
    user2: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
    initiated_by: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
    conversation_id: { type: Schema.Types.ObjectId as any, ref: "Conversation", required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Compound unique index on the sorted user pair - ensures same two users can only match once
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Index for looking up matches by user
matchSchema.index({ users: 1 });

export const Match = model<IMatch>("Match", matchSchema);
