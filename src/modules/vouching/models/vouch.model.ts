import { Schema, model, type Document } from "mongoose";

interface IVouch extends Document {
  voucher_id: string;
  vouchee_id: string;
  created_at: Date;
}

const vouchSchema = new Schema<IVouch>(
  {
    voucher_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    vouchee_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

vouchSchema.index({ voucher_id: 1, vouchee_id: 1 }, { unique: true });
vouchSchema.index({ vouchee_id: 1 });

export const Vouch = model<IVouch>("Vouch", vouchSchema);
