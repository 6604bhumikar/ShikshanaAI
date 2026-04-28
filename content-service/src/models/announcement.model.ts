import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    courseId: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Announcement =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);
