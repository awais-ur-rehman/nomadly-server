import { Schema, model, type Document } from "mongoose";

export interface IStory extends Document {
    author_id: Schema.Types.ObjectId;
    asset_url: string;
    asset_type: "image" | "video";
    views: Schema.Types.ObjectId[];
    created_at: Date;
    expires_at: Date;
}

const storySchema = new Schema<IStory>(
    {
        author_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        asset_url: {
            type: String,
            required: true,
        },
        asset_type: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },
        views: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }],
        expires_at: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

// TTL index for automatic deletion after 24 hours
// MongoDB will automatically delete documents when expires_at is in the past
storySchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Index for fetching stories by author
storySchema.index({ author_id: 1, created_at: -1 });

export const Story = model<IStory>("Story", storySchema);
