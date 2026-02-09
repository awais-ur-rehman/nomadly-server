import { Schema, model, type Document } from "mongoose";

export interface ISwipe extends Document {
    actor_id: string;
    target_id: string;
    action: "like" | "pass" | "super_like";
    created_at: Date;
}

const swipeSchema = new Schema<ISwipe>(
    {
        actor_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
        target_id: { type: Schema.Types.ObjectId as any, required: true, ref: "User" },
        action: {
            type: String,
            enum: ["like", "pass", "super_like"],
            required: true,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

// Ensure a user can only swipe once per target
swipeSchema.index({ actor_id: 1, target_id: 1 }, { unique: true });

export const Swipe = model<ISwipe>("Swipe", swipeSchema);
