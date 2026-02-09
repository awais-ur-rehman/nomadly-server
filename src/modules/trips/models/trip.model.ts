import { Schema, model, type Document } from "mongoose";

interface ITripInterest {
  user_id: Schema.Types.ObjectId;
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: Date;
}

interface ITrip extends Document {
  creator_id: Schema.Types.ObjectId;
  title: string;
  description: string;

  origin: {
    type: "Point";
    coordinates: [number, number];
    place_name?: string;
  };
  destination: {
    type: "Point";
    coordinates: [number, number];
    place_name?: string;
  };

  start_date: Date;
  duration_days: number;

  looking_for_companions: boolean;
  max_companions: number;

  interested_users: ITripInterest[];
  companions: Schema.Types.ObjectId[];

  status: "planning" | "active" | "completed" | "cancelled";
  visibility: "public" | "followers_only" | "private";

  created_at: Date;
  updated_at: Date;
}

const tripInterestSchema = new Schema<ITripInterest>({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  message: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending"
  },
  created_at: { type: Date, default: Date.now },
});

const tripSchema = new Schema<ITrip>(
  {
    creator_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, default: "" },

    origin: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      place_name: { type: String },
    },
    destination: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      place_name: { type: String },
    },

    start_date: { type: Date, required: true },
    duration_days: { type: Number, required: true, min: 1 },

    looking_for_companions: { type: Boolean, default: true },
    max_companions: { type: Number, default: 4 },

    interested_users: [tripInterestSchema],
    companions: [{ type: Schema.Types.ObjectId, ref: "User" }],

    status: {
      type: String,
      enum: ["planning", "active", "completed", "cancelled"],
      default: "planning",
    },
    visibility: {
      type: String,
      enum: ["public", "followers_only", "private"],
      default: "public",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Geospatial indexes for discovery
tripSchema.index({ "origin": "2dsphere" });
tripSchema.index({ "destination": "2dsphere" });
tripSchema.index({ start_date: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ creator_id: 1 });

export const Trip = model<ITrip>("Trip", tripSchema);
