"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const certificateSchema = new mongoose_1.default.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    certificateId: { type: String, required: true, unique: true },
    filePath: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true },
}, { timestamps: true });
exports.Certificate = mongoose_1.default.models.Certificate ||
    mongoose_1.default.model("Certificate", certificateSchema);
