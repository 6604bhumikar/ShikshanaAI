"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enrollmentSchema = new mongoose_1.default.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    completedLessons: { type: [String], default: [] },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
}, { timestamps: true });
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
exports.Enrollment = mongoose_1.default.model("Enrollment", enrollmentSchema);
