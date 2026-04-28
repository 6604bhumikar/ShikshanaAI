"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const moderationSchema = new mongoose_1.default.Schema({
    courseId: { type: String, required: true },
    action: { type: String, enum: ["approved", "rejected"], required: true },
    performedBy: { type: String, required: true },
    reason: { type: String }
}, { timestamps: true });
exports.ModerationLog = mongoose_1.default.model("ModerationLog", moderationSchema);
