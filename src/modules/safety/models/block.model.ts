import { Schema, model, type Document } from "mongoose";

export interface IBlock extends Document {
  blocker_id: string;
  blocked_id: string;
  created_at: Date;
}

const blockSchema = new Schema<IBlock>(
  {
    blocker_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    blocked_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// A user can only block another user once
blockSchema.index({ blocker_id: 1, blocked_id: 1 }, { unique: true });
// Fast lookup: "has user A blocked user B?" or "who has user A blocked?"
blockSchema.index({ blocker_id: 1 });
// Fast lookup: "who has blocked user B?" (for filtering them out of feeds)
blockSchema.index({ blocked_id: 1 });

export const Block = model<IBlock>("Block", blockSchema);
