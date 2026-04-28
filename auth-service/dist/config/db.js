"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("Auth DB connected");
    }
    catch (err) {
        console.error("DB connection failed", err);
        console.log("Continuing without database connection for development...");
        // Don't exit process, continue without DB for testing
    }
};
exports.connectDB = connectDB;
console.log("Connecting to:", process.env.MONGO_URI);
