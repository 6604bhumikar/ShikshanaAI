import mongoose, { Schema } from "mongoose";

const AssignmentSchema = new Schema(
  {
    courseId: { type: String, required: true, index: true },
    teacherId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    instructions: { type: String, default: "" },
    maxMarks: { type: Number, required: true, default: 100 },
    dueDate: { type: Date, default: null },
    type: { type: String, default: "file" },
  },
  { timestamps: true }
);

const AssignmentSubmissionSchema = new Schema(
  {
    assignmentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    pdfName: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
    score: { type: Number, default: null },
    remarks: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Assignment =
  mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);

export const AssignmentSubmission =
  mongoose.models.AssignmentSubmission ||
  mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
