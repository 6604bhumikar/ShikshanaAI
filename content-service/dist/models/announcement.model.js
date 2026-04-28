"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const announcementSchema = new mongoose_1.default.Schema({
    teacherId: { type: String, required: true },
    courseId: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });
exports.Announcement = mongoose_1.default.models.Announcement ||
    mongoose_1.default.model("Announcement", announcementSchema);
