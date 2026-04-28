"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const settingsSchema = new mongoose_1.default.Schema({
    siteName: { type: String, default: "Shikshana LMS" },
    tagline: { type: String, default: "Empowering Education with Technology" },
    supportEmail: { type: String, default: "support@shikshana.in" },
    contactNumber: { type: String, default: "+91 98765 43210" },
    websiteUrl: { type: String, default: "https://shikshana.in" },
    enableModeration: { type: Boolean, default: true },
    autoPayouts: { type: Boolean, default: false },
    darkTheme: { type: Boolean, default: false },
}, { timestamps: true });
exports.Settings = mongoose_1.default.models.Settings || mongoose_1.default.model("Settings", settingsSchema);
