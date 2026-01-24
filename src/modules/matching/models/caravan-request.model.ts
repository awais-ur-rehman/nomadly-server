import { Schema, model, type Document } from "mongoose";

interface ICaravanRequest extends Document {
  requester_id: string;
  target_user_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: Date;
}

const caravanRequestSchema = new Schema<ICaravanRequest>(
  {
    requester_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    target_user_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

caravanRequestSchema.index({ requester_id: 1, target_user_id: 1 });

export const CaravanRequest = model<ICaravanRequest>("CaravanRequest", caravanRequestSchema);
