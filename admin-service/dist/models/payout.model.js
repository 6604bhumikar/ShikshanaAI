"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payout = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const payoutSchema = new mongoose_1.default.Schema({
    teacherId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "on-hold"],
        default: "pending",
    },
}, { timestamps: true });
exports.Payout = mongoose_1.default.models.Payout || mongoose_1.default.model("Payout", payoutSchema);
