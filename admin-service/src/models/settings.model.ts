import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Shikshana LMS" },
    tagline: { type: String, default: "Empowering Education with Technology" },
    supportEmail: { type: String, default: "support@shikshana.in" },
    contactNumber: { type: String, default: "+91 98765 43210" },
    websiteUrl: { type: String, default: "https://shikshana.in" },
    enableModeration: { type: Boolean, default: true },
    autoPayouts: { type: Boolean, default: false },
    darkTheme: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
