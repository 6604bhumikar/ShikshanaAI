import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    certificateId: { type: String, required: true, unique: true },
    filePath: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Certificate =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);
