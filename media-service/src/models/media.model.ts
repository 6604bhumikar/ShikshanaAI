import mongoose, { Schema } from "mongoose";

const mediaSchema = new Schema(
  {
    courseId: { type: String, required: true },
    moduleId: { type: String, default: "" },
    lessonId: { type: String, default: "standalone" },
    title: { type: String, required: true },
    filePath: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    originalName: { type: String, default: "" },
    teacherId: { type: String, required: true },
    uploadedBy: { type: String, required: true }
  },
  { timestamps: true }
);

export const Media = mongoose.model("Media", mediaSchema);
