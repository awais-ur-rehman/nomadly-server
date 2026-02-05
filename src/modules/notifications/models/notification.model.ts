import { Schema, model, type Document } from "mongoose";

export interface INotification extends Document {
    user_id: Schema.Types.ObjectId;
    title: string;
    body: string;
    type: "match" | "message" | "activity_approval" | "vouch" | "system";
    data?: any;
    is_read: boolean;
    created_at: Date;
    updated_at: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        type: {
            type: String,
            enum: ["match", "message", "activity_approval", "vouch", "system"],
            required: true,
        },
        data: { type: Schema.Types.Mixed },
        is_read: { type: Boolean, default: false },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

notificationSchema.index({ user_id: 1, created_at: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
