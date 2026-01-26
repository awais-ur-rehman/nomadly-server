import { Schema, model, type Document } from "mongoose";

interface IMatch extends Document {
  users: string[];
  initiated_by: string;
  conversation_id: string;
  created_at: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    users: [{ type: Schema.Types.ObjectId as any, ref: "User", required: true }],
    initiated_by: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
    conversation_id: { type: Schema.Types.ObjectId as any, ref: "Conversation", required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Ensure unique match between two users
matchSchema.index({ users: 1 }, { unique: true });

export const Match = model<IMatch>("Match", matchSchema);
