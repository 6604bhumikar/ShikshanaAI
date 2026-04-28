"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Community = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    authorId: { type: String, required: true },
    authorRole: { type: String, required: true },
    text: { type: String, required: true },
}, { timestamps: true });
const communitySchema = new mongoose_1.default.Schema({
    teacherId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    members: [{ type: String }],
    joinRequests: [{ type: String }],
    posts: [postSchema],
}, { timestamps: true });
exports.Community = mongoose_1.default.models.Community || mongoose_1.default.model("Community", communitySchema);
