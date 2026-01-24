import { Schema, model, type Document } from "mongoose";

interface IReview extends Document {
  consultation_id: string;
  reviewer_id: string;
  builder_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    consultation_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Consultation",
    },
    reviewer_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    builder_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

reviewSchema.index({ builder_id: 1 });
reviewSchema.index({ consultation_id: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);
