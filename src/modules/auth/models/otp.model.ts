import { Schema, model, type Document } from "mongoose";

interface IOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, code: 1 });

export const Otp = model<IOtp>("Otp", otpSchema);
