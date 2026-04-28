import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Wishlist =
  mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
