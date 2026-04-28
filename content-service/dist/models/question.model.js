"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    lessonId: { type: String, default: null },
    question: { type: String, required: true },
    reply: { type: String, default: "" },
    repliedBy: { type: String, default: null },
}, { timestamps: true });
exports.Question = mongoose_1.default.models.Question || mongoose_1.default.model("Question", questionSchema);
