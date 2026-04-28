
import mongoose from "mongoose";

const moderationSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    action: { type: String, enum: ["approved", "rejected"], required: true },
    performedBy: { type: String, required: true },
    reason: { type: String }
  },
  { timestamps: true }
);

export const ModerationLog = mongoose.model("ModerationLog", moderationSchema);
