
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
