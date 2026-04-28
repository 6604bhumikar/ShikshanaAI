"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logSchema = new mongoose_1.default.Schema({
    service: { type: String, required: true },
    level: { type: String, enum: ["info", "warn", "error"], required: true },
    message: { type: String, required: true },
    meta: { type: Object },
    requestId: { type: String },
    timestamp: { type: Date, default: Date.now }
});
exports.Log = mongoose_1.default.model("Log", logSchema);
