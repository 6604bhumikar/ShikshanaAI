"use strict";
// import mongoose from "mongoose";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
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
const mongoose_1 = __importStar(require("mongoose"));
const LessonSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ["video", "text", "quiz"],
        required: true
    },
    contentUrl: String, // for video (mediaId)
    textContent: String, // for text lessons
    duration: Number, // in seconds
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false }
}, { _id: true });
const UnitSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    order: { type: Number, required: true },
    lessons: [LessonSchema]
}, { _id: true });
const CourseSchema = new mongoose_1.Schema({
    teacherId: { type: mongoose_1.Types.ObjectId, required: true },
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
}, { timestamps: true });
exports.Course = mongoose_1.default.model("Course", CourseSchema);
