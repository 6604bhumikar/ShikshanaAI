"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });
exports.User = mongoose_1.default.model("User", userSchema);
