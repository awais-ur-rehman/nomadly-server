import { Schema, model, type Document } from "mongoose";

interface IConsultation extends Document {
  requester_id: string;
  builder_id: string;
  specialty: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  scheduled_time?: Date;
  payment_status: "unpaid" | "paid" | "refunded";
  payment_id?: string;
  created_at: Date;
}

const consultationSchema = new Schema<IConsultation>(
  {
    requester_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    builder_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
    specialty: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    scheduled_time: { type: Date },
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    payment_id: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

consultationSchema.index({ requester_id: 1 });
consultationSchema.index({ builder_id: 1 });
consultationSchema.index({ status: 1 });

export const Consultation = model<IConsultation>("Consultation", consultationSchema);
