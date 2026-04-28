"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wishlist = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wishlistSchema = new mongoose_1.default.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
}, { timestamps: true });
wishlistSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
exports.Wishlist = mongoose_1.default.models.Wishlist || mongoose_1.default.model("Wishlist", wishlistSchema);
