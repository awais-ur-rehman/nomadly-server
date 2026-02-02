import { Schema, model, type Document } from "mongoose";

export interface IReport extends Document {
  reporter_id: string;
  reported_id: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    reported_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    reason: {
      type: String,
      required: true,
      enum: [
        "harassment",
        "fake_profile",
        "inappropriate_content",
        "spam",
        "threatening_behavior",
        "underage",
        "scam",
        "other",
      ],
    },
    description: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    admin_notes: { type: String },
    resolved_by: { type: Schema.Types.ObjectId as any, ref: "User" },
    resolved_at: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

reportSchema.index({ reported_id: 1 });
reportSchema.index({ reporter_id: 1 });
reportSchema.index({ status: 1 });
// Prevent duplicate reports for same reason from same user
reportSchema.index({ reporter_id: 1, reported_id: 1, reason: 1 }, { unique: true });

export const Report = model<IReport>("Report", reportSchema);
