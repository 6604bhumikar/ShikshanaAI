"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const register = async (req, res) => {
    try {
        const parsed = auth_validator_1.registerSchema.parse(req.body);
        const user = await (0, auth_service_1.registerUser)(parsed.name, parsed.email, parsed.password, parsed.role);
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "your_secret_key", { expiresIn: "1d" });
        res.status(201).json({
            success: true,
            token,
            user,
        });
    }
    catch (error) {
        console.log("REGISTER ERROR:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Registration failed",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const parsed = auth_validator_1.loginSchema.parse(req.body);
        const { user, token } = await (0, auth_service_1.loginUser)(parsed.email, parsed.password);
        res.json({ success: true, token, user });
    }
    catch (error) {
        console.log("LOGIN ERROR:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Login failed",
        });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const result = await (0, auth_service_1.createPasswordResetToken)(String(req.body.email || ""));
        res.json({
            success: true,
            message: "Password reset link generated",
            resetUrl: `/reset-password/${result.token}?email=${encodeURIComponent(result.email)}`,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to generate reset link",
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        await (0, auth_service_1.resetPasswordWithToken)(String(req.body.email || ""), String(req.body.token || ""), String(req.body.password || ""));
        res.json({ success: true, message: "Password reset successful" });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to reset password",
        });
    }
};
exports.resetPassword = resetPassword;
