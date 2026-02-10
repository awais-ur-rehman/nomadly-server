import { Schema, model, type Document } from "mongoose";

export interface IJobPayment extends Document {
    job_id: Schema.Types.ObjectId;
    payer_id: Schema.Types.ObjectId;   // job author who pays
    payee_id: Schema.Types.ObjectId;   // hired worker
    amount: number;
    status: "pending" | "paid" | "failed";
    revenue_cat_transaction_id?: string;
    created_at: Date;
    updated_at: Date;
}

const jobPaymentSchema = new Schema<IJobPayment>(
    {
        job_id: { type: Schema.Types.ObjectId as any, required: true, ref: "Job", unique: true },
        payer_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
        payee_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        revenue_cat_transaction_id: { type: String, default: null },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

jobPaymentSchema.index({ job_id: 1 });
jobPaymentSchema.index({ payer_id: 1 });
jobPaymentSchema.index({ payee_id: 1 });

export const JobPayment = model<IJobPayment>("JobPayment", jobPaymentSchema);
