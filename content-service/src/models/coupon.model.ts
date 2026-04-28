import mongoose, { Schema } from "mongoose";

const CouponSchema = new Schema(
  {
    courseId: { type: String, required: true, index: true },
    teacherId: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CouponSchema.index({ courseId: 1, code: 1 }, { unique: true });

export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
