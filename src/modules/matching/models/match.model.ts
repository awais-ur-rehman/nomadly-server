import { Schema, model, type Document } from "mongoose";

interface IMatch extends Document {
  user_id: string;
  matched_user_id: string;
  swipe_action: "left" | "right" | "star";
  is_mutual: boolean;
  created_at: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    user_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    matched_user_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    swipe_action: {
      type: String,
      enum: ["left", "right", "star"],
      required: true,
    },
    is_mutual: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

matchSchema.index({ user_id: 1, matched_user_id: 1 }, { unique: true });
matchSchema.index({ user_id: 1, is_mutual: 1 });

export const Match = model<IMatch>("Match", matchSchema);
