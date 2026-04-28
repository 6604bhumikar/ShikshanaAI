import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

reviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
