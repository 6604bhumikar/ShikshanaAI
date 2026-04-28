import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "on-hold"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Payout =
  mongoose.models.Payout || mongoose.model("Payout", payoutSchema);
