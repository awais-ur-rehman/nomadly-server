import { Schema, model, type Document } from "mongoose";

export interface IFollow extends Document {
    follower_id: Schema.Types.ObjectId;
    following_id: Schema.Types.ObjectId;
    status: "active" | "pending";
    created_at: Date;
}

const followSchema = new Schema<IFollow>(
    {
        follower_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        following_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["active", "pending"],
            default: "active"
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

// Compound index to prevent duplicate follows
followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });
// Indexes for querying followers/following
followSchema.index({ follower_id: 1, status: 1 });
followSchema.index({ following_id: 1, status: 1 });

export const Follow = model<IFollow>("Follow", followSchema);
