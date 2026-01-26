import { Schema, model, type Document } from "mongoose";

export interface IComment extends Document {
    post_id: Schema.Types.ObjectId;
    author_id: Schema.Types.ObjectId;
    text: string;
    created_at: Date;
}

const commentSchema = new Schema<IComment>(
    {
        post_id: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true,
        },
        author_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

// Index for fetching comments by post
commentSchema.index({ post_id: 1, created_at: -1 });

export const Comment = model<IComment>("Comment", commentSchema);
