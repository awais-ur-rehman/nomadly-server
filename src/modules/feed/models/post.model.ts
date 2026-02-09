import { Schema, model, type Document } from "mongoose";

export interface IPost extends Document {
    author_id: Schema.Types.ObjectId;
    photos: string[];
    caption: string;
    tags: string[];
    likes: Schema.Types.ObjectId[];
    comments_count: number;
    created_at: Date;
    updated_at: Date;
}

const postSchema = new Schema<IPost>(
    {
        author_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        photos: {
            type: [String],
            required: true,
            validate: {
                validator: (v: string[]) => v.length > 0 && v.length <= 10,
                message: "Posts must have between 1 and 10 photos",
            },
        },
        caption: {
            type: String,
            maxlength: 2200,
            default: "",
        },
        tags: {
            type: [String],
            default: [],
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }],
        comments_count: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// Indexes for feed queries
postSchema.index({ author_id: 1, created_at: -1 });
postSchema.index({ created_at: -1 });
postSchema.index({ tags: 1 });

export const Post = model<IPost>("Post", postSchema);
