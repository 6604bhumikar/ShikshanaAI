
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    completedLessons: { type: [String], default: [] },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
