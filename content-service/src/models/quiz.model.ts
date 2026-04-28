import mongoose, { Schema } from "mongoose";

const QuizQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    type: { type: String, required: true, default: "mcq" },
    options: { type: [Schema.Types.Mixed], default: [] },
    correctAnswer: { type: Schema.Types.Mixed, default: null },
    marks: { type: Number, default: 1 },
  },
  { _id: true }
);

const QuizSchema = new Schema(
  {
    courseId: { type: String, required: true, index: true },
    unitId: { type: String, default: null, index: true },
    teacherId: { type: String, required: true, index: true },
    kind: { type: String, enum: ["unit", "final"], required: true },
    title: { type: String, default: "" },
    duration: { type: Number, default: null },
    passPercentage: { type: Number, default: 40 },
    questions: { type: [QuizQuestionSchema], default: [] },
  },
  { timestamps: true }
);

QuizSchema.index(
  { courseId: 1, unitId: 1, kind: 1 },
  { unique: true, partialFilterExpression: { unitId: { $exists: true } } }
);

const QuizAttemptSchema = new Schema(
  {
    courseId: { type: String, required: true, index: true },
    unitId: { type: String, default: null, index: true },
    kind: { type: String, enum: ["unit", "final"], required: true },
    studentId: { type: String, required: true, index: true },
    answers: { type: [Schema.Types.Mixed], default: [] },
    obtainedMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    attemptNo: { type: Number, default: 1 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);

export const QuizAttempt =
  mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);
