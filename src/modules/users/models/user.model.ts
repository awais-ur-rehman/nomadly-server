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
    type: "van" | "bus" | "truck" | "car" | "rv" | "sprinter" | "skoolie" | "suv" | "truck_camper" | "other";
    crew_type: "solo" | "couple" | "family" | "friends" | "with_pets";
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
    business_name?: string;
    specialty_tags: string[];
    hourly_rate: number;
    availability_status: "available" | "busy";
    bio: string;
    portfolio_images?: string[];
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
  verification: {
    email: { status: "none" | "verified"; verified_at?: Date };
    phone: { status: "none" | "submitted" | "verified"; number?: string; verified_at?: Date };
    photo: {
      status: "none" | "pending" | "verified" | "rejected";
      selfie_url?: string;
      submitted_at?: Date;
      verified_at?: Date;
      rejection_reason?: string;
    };
    id_document: {
      status: "none" | "pending" | "verified" | "rejected";
      document_url?: string;
      document_type?: string;
      submitted_at?: Date;
      verified_at?: Date;
      rejection_reason?: string;
    };
    community: {
      status: "none" | "verified";
      vouch_count: number;
      verified_at?: Date;
    };
    level: number; // 0-5 computed from above
    badge: "none" | "basic" | "trusted" | "verified" | "super_verified" | "nomad_elite";
  };
  role: "user" | "admin";
  invited_by?: string;
  invite_count: number;
  is_active: boolean;
  ai_usage: {
    count: number;
    last_reset: Date;
  };
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
        enum: ["van", "bus", "truck", "car", "rv", "sprinter", "skoolie", "suv", "truck_camper", "other"],
      },
      crew_type: {
        type: String,
        enum: ["solo", "couple", "family", "friends", "with_pets"],
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
      business_name: { type: String },
      specialty_tags: { type: [String], default: [] },
      hourly_rate: { type: Number, default: 0 },
      availability_status: {
        type: String,
        enum: ["available", "busy"],
        default: "available",
      },
      bio: { type: String },
      portfolio_images: { type: [String], default: [] },
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
    verification: {
      email: {
        status: { type: String, enum: ["none", "verified"], default: "none" },
        verified_at: { type: Date },
      },
      phone: {
        status: { type: String, enum: ["none", "submitted", "verified"], default: "none" },
        number: { type: String },
        verified_at: { type: Date },
      },
      photo: {
        status: { type: String, enum: ["none", "pending", "verified", "rejected"], default: "none" },
        selfie_url: { type: String },
        submitted_at: { type: Date },
        verified_at: { type: Date },
        rejection_reason: { type: String },
      },
      id_document: {
        status: { type: String, enum: ["none", "pending", "verified", "rejected"], default: "none" },
        document_url: { type: String },
        document_type: { type: String },
        submitted_at: { type: Date },
        verified_at: { type: Date },
        rejection_reason: { type: String },
      },
      community: {
        status: { type: String, enum: ["none", "verified"], default: "none" },
        vouch_count: { type: Number, default: 0 },
        verified_at: { type: Date },
      },
      level: { type: Number, default: 0, min: 0, max: 5 },
      badge: {
        type: String,
        enum: ["none", "basic", "trusted", "verified", "super_verified", "nomad_elite"],
        default: "none",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    invited_by: { type: Schema.Types.ObjectId as any, ref: "User" },
    invite_count: { type: Number, default: 3 },
    is_active: { type: Boolean, default: false },
    ai_usage: {
      count: { type: Number, default: 0 },
      last_reset: { type: Date, default: Date.now },
    },
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
