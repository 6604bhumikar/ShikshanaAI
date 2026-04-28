"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLog = void 0;
const axios_1 = __importDefault(require("axios"));
const sendLog = async (level, message, meta = {}, requestId) => {
    try {
        await axios_1.default.post(`${process.env.LOGGING_SERVICE_URL}/internal/log`, {
            service: "api-gateway",
            level,
            message,
            meta,
            requestId
        });
    }
    catch (err) {
        console.error("Failed to send log", err);
    }
};
exports.sendLog = sendLog;
