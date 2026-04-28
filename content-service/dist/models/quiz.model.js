"use strict";
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
exports.QuizAttempt = exports.Quiz = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const QuizQuestionSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    type: { type: String, required: true, default: "mcq" },
    options: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    correctAnswer: { type: mongoose_1.Schema.Types.Mixed, default: null },
    marks: { type: Number, default: 1 },
}, { _id: true });
const QuizSchema = new mongoose_1.Schema({
    courseId: { type: String, required: true, index: true },
    unitId: { type: String, default: null, index: true },
    teacherId: { type: String, required: true, index: true },
    kind: { type: String, enum: ["unit", "final"], required: true },
    title: { type: String, default: "" },
    duration: { type: Number, default: null },
    passPercentage: { type: Number, default: 40 },
    questions: { type: [QuizQuestionSchema], default: [] },
}, { timestamps: true });
QuizSchema.index({ courseId: 1, unitId: 1, kind: 1 }, { unique: true, partialFilterExpression: { unitId: { $exists: true } } });
const QuizAttemptSchema = new mongoose_1.Schema({
    courseId: { type: String, required: true, index: true },
    unitId: { type: String, default: null, index: true },
    kind: { type: String, enum: ["unit", "final"], required: true },
    studentId: { type: String, required: true, index: true },
    answers: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    obtainedMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    attemptNo: { type: Number, default: 1 },
    completedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Quiz = mongoose_1.default.models.Quiz || mongoose_1.default.model("Quiz", QuizSchema);
exports.QuizAttempt = mongoose_1.default.models.QuizAttempt || mongoose_1.default.model("QuizAttempt", QuizAttemptSchema);
