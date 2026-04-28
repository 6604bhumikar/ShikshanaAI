import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    lessonId: { type: String, default: null },
    question: { type: String, required: true },
    reply: { type: String, default: "" },
    repliedBy: { type: String, default: null },
  },
  { timestamps: true }
);

export const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
