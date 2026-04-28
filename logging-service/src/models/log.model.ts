
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  service: { type: String, required: true },
  level: { type: String, enum: ["info", "warn", "error"], required: true },
  message: { type: String, required: true },
  meta: { type: Object },
  requestId: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const Log = mongoose.model("Log", logSchema);
