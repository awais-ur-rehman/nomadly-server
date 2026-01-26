import { Schema, model, type Document } from "mongoose";
import { type GeospatialPoint } from "../../../types";

export interface IUser extends Document {
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  is_private: boolean;
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
  matching_profile: {
    intent: "friends" | "dating" | "both";
    preferences: {
      gender_interest: string[];
      min_age: number;
      max_age: number;
      max_distance_km: number;
    };
    is_discoverable: boolean;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password_hash: { type: String, required: true },
    is_private: { type: Boolean, default: false },
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
    matching_profile: {
      intent: {
        type: String,
        enum: ["friends", "dating", "both"],
        default: "friends",
      },
      preferences: {
        gender_interest: { type: [String], default: ["all"] },
        min_age: { type: Number, default: 18 },
        max_age: { type: Number, default: 100 },
        max_distance_km: { type: Number, default: 100 },
      },
      is_discoverable: { type: Boolean, default: true },
    },
    is_active: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ "travel_route.origin": "2dsphere" }, { sparse: true });
userSchema.index({ "travel_route.destination": "2dsphere" }, { sparse: true });
userSchema.index({ "rig.type": 1, "profile.intent": 1 });
userSchema.index({ "nomad_id.verified": 1 });
userSchema.index({ "profile.name": "text", username: "text" }); // Text search index

export const User = model<IUser>("User", userSchema);
