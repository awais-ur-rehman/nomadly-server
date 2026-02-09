import { Schema, model, type Document } from "mongoose";

interface IActivity extends Document {
  host_id: string;
  title: string;
  activity_type: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  max_participants: number;
  current_participants: string[];
  pending_requests: string[];
  event_time: Date;
  description: string;
  verified_only: boolean;
  status: "open" | "full" | "expired";
  created_at: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    host_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    title: { type: String, required: true },
    activity_type: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    max_participants: { type: Number, required: true, min: 1 },
    current_participants: [{ type: Schema.Types.ObjectId as any, ref: "User" }],
    pending_requests: [{ type: Schema.Types.ObjectId as any, ref: "User" }],
    event_time: { type: Date, required: true },
    description: { type: String },
    verified_only: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["open", "full", "expired"],
      default: "open",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

activitySchema.index({ location: "2dsphere" });
activitySchema.index({ event_time: 1 });
activitySchema.index({ status: 1 });

export const Activity = model<IActivity>("Activity", activitySchema);
