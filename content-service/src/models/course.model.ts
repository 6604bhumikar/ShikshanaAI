
// import mongoose from "mongoose";

// const courseSchema = new mongoose.Schema(
//   {
    
//     teacherId: { type: String, required: true },
//     title: { type: String, required: true },
//     slug: { type: String, required: true, unique: true },
//     description: { type: String, required: true },
//     price: { type: Number, default: 0 },
//     isFree: { type: Boolean, default: false },
//     level: { type: String },
//     language: { type: String },
//     thumbnail: { type: String },
//     status: {
//       type: String,
//       enum: ["draft", "review", "published", "rejected"],
//       default: "draft"
//     },
//     enrollCount: { type: Number, default: 0 },
//     ratingAvg: { type: Number, default: 0 },
//     ratingCount: { type: Number, default: 0 }
//   },
//   { timestamps: true }
// );

// export const Course = mongoose.model("Course", courseSchema);



import mongoose, { Schema, Types } from "mongoose";

const LessonSchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "text", "quiz"],
      required: true
    },
    contentUrl: String,        // for video (mediaId)
    textContent: String,       // for text lessons
    duration: Number,          // in seconds
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false }
  },
  { _id: true }
);

const UnitSchema = new Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    lessons: [LessonSchema]
  },
  { _id: true }
);

const CourseSchema = new Schema(
  {
    teacherId: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    category: String,
    price: Number,
    isFree: Boolean,
    isSequential: { type: Boolean, default: true },
    thumbnail: String,
    language: { type: String, default: "English" },

    status: {
      type: String,
      enum: ["draft", "review", "published", "rejected"],
      default: "draft"
    },

    enrollCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    units: [UnitSchema]
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", CourseSchema);
