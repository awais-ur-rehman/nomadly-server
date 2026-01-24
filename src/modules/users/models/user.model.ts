import { Schema, model, type Document } from "mongoose";
import { type GeospatialPoint } from "../../../types";

interface IUser extends Document {
  email: string;
  phone?: string;
  password_hash: string;
  profile: {
    name: string;
    age?: number;
    gender?: string;
    photo_url?: string;
    hobbies: string[];
    intent: "friends" | "dating" | "both";
    bio?: string;
  };
  rig: {
    type: "sprinter" | "skoolie" | "suv" | "truck_camper";
    crew_type: "solo" | "couple" | "with_pets";
    pet_friendly: boolean;
  };
  travel_route?: {
    origin: GeospatialPoint;
    destination: GeospatialPoint;
    start_date: Date;
    duration_days: number;
  };
  is_builder: boolean;
  builder_profile?: {
    specialty_tags: string[];
    hourly_rate: number;
    availability_status: "available" | "busy";
    bio: string;
  };
  nomad_id: {
    verified: boolean;
    member_since: Date;
    vouch_count: number;
  };
  subscription: {
    status: "active" | "expired" | "cancelled";
    plan: "free" | "vantage_pro";
    expires_at?: Date;
    revenue_cat_id?: string;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password_hash: { type: String, required: true },
    profile: {
      name: { type: String, default: "" },
      age: { type: Number },
      gender: { type: String },
      photo_url: { type: String },
      hobbies: { type: [String], default: [] },
      intent: {
        type: String,
        enum: ["friends", "dating", "both"],
        default: "friends",
      },
      bio: { type: String },
    },
    rig: {
      type: {
        type: String,
        enum: ["sprinter", "skoolie", "suv", "truck_camper"],
      },
      crew_type: {
        type: String,
        enum: ["solo", "couple", "with_pets"],
        default: "solo",
      },
      pet_friendly: { type: Boolean, default: false },
    },
    travel_route: {
      origin: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
        },
      },
      destination: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
        },
      },
      start_date: { type: Date },
      duration_days: { type: Number },
    },
    is_builder: { type: Boolean, default: false },
    builder_profile: {
      specialty_tags: { type: [String], default: [] },
      hourly_rate: { type: Number, default: 0 },
      availability_status: {
        type: String,
        enum: ["available", "busy"],
        default: "available",
      },
      bio: { type: String },
    },
    nomad_id: {
      verified: { type: Boolean, default: false },
      member_since: { type: Date, default: Date.now },
      vouch_count: { type: Number, default: 0 },
    },
    subscription: {
      status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "expired",
      },
      plan: {
        type: String,
        enum: ["free", "vantage_pro"],
        default: "free",
      },
      expires_at: { type: Date },
      revenue_cat_id: { type: String },
    },
    is_active: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.index({ "travel_route.origin": "2dsphere" }, { sparse: true });
userSchema.index({ "travel_route.destination": "2dsphere" }, { sparse: true });
userSchema.index({ "rig.type": 1, "profile.intent": 1 });
userSchema.index({ "nomad_id.verified": 1 });

export const User = model<IUser>("User", userSchema);
