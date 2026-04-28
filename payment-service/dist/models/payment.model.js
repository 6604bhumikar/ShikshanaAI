"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    coursePrice: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["created", "success", "failed"], default: "created" }
}, { timestamps: true });
exports.Payment = mongoose_1.default.model("Payment", paymentSchema);
