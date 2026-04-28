
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
