import { Schema, model, type Document } from "mongoose";
import crypto from "crypto";

export interface IInviteCode extends Document {
  code: string;
  created_by: string;
  used_by?: string[];
  used_at?: Date;
  max_uses: number;
  use_count: number;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
}

const inviteCodeSchema = new Schema<IInviteCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    created_by: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    used_by: [{ type: Schema.Types.ObjectId as any, ref: "User" }],
    used_at: { type: Date },
    max_uses: { type: Number, default: 1 },
    use_count: { type: Number, default: 0 },
    expires_at: { type: Date },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

inviteCodeSchema.index({ code: 1 }, { unique: true });
inviteCodeSchema.index({ created_by: 1 });
inviteCodeSchema.index({ is_active: 1 });

/**
 * Generate a human-friendly invite code: NOMAD-XXXXX
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O/1/I to avoid confusion
  let result = "NOMAD-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(crypto.randomInt(chars.length));
  }
  return result;
}

export const InviteCode = model<IInviteCode>("InviteCode", inviteCodeSchema);
