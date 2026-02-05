import { Schema, model, type Document } from "mongoose";

export interface IJobApplication extends Document {
    job_id: string;
    applicant_id: string;
    cover_letter: string;
    status: "pending" | "interview" | "hired" | "rejected";
    created_at: Date;
    updated_at: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
    {
        job_id: { type: Schema.Types.ObjectId as any, required: true, ref: "Job" },
        applicant_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
        cover_letter: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "interview", "hired", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// Compound index to prevent duplicate applications from same user to same job
jobApplicationSchema.index({ job_id: 1, applicant_id: 1 }, { unique: true });
jobApplicationSchema.index({ job_id: 1, status: 1 });
jobApplicationSchema.index({ applicant_id: 1, created_at: -1 });

export const JobApplication = model<IJobApplication>("JobApplication", jobApplicationSchema);
