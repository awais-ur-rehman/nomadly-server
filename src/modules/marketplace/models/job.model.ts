import { Schema, model, type Document } from "mongoose";

export interface IJob extends Document {
    author_id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    budget_type: "fixed" | "hourly";
    location: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
    is_remote: boolean;
    status: "open" | "in_progress" | "completed" | "closed";
    created_at: Date;
    updated_at: Date;
}

const jobSchema = new Schema<IJob>(
    {
        author_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        category: { type: String, required: true }, // e.g., 'mechanical', 'electrical', 'general'
        budget: { type: Number, required: true },
        budget_type: {
            type: String,
            enum: ["fixed", "hourly"],
            default: "fixed"
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
        is_remote: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["open", "in_progress", "completed", "closed"],
            default: "open",
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

jobSchema.index({ location: "2dsphere" });
jobSchema.index({ author_id: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ created_at: -1 });

export const Job = model<IJob>("Job", jobSchema);
