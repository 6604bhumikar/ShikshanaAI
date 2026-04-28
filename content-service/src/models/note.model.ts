import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Note =
  mongoose.models.Note || mongoose.model("Note", noteSchema);
