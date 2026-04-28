"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
}, { timestamps: true });
reviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
exports.Review = mongoose_1.default.models.Review || mongoose_1.default.model("Review", reviewSchema);
