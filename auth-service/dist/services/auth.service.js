"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithToken = exports.createPasswordResetToken = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../models/user.model");
const memoryUsers = new Map();
const resetTokens = new Map();
const isDatabaseReady = () => mongoose_1.default.connection.readyState === 1;
const createAuthError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
const findUserByEmail = async (email) => {
    if (isDatabaseReady()) {
        return user_model_1.User.findOne({ email });
    }
    return memoryUsers.get(email) ?? null;
};
const createUser = async (name, email, passwordHash, role) => {
    if (isDatabaseReady()) {
        return user_model_1.User.create({
            name,
            email,
            passwordHash,
            role,
        });
    }
    const user = {
        _id: new mongoose_1.default.Types.ObjectId().toString(),
        name,
        email,
        passwordHash,
        role,
        tokenVersion: 0,
    };
    memoryUsers.set(email, user);
    return user;
};
//export const registerUser = async (name: string, email: string, password: string,)//
//WAS ONLY THERE,CHGED COZ WAS GETTING ERROR AS REGISTRATION FAILED//
const registerUser = async (name, email, password, role) => {
    const existing = await findUserByEmail(email);
    if (existing)
        throw createAuthError("Email already registered", 409);
    const hash = await bcrypt_1.default.hash(password, 12);
    const user = await createUser(name, email, hash, role);
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user)
        throw createAuthError("Invalid credentials", 401);
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid)
        throw createAuthError("Invalid credentials", 401);
    const expiresIn = process.env.JWT_EXPIRES_IN;
    const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn });
    return { user, token };
};
exports.loginUser = loginUser;
const createPasswordResetToken = async (email) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw createAuthError("No account found for that email", 404);
    }
    const token = new mongoose_1.default.Types.ObjectId().toString();
    resetTokens.set(token, {
        email,
        expiresAt: Date.now() + 1000 * 60 * 60,
    });
    return { token, email };
};
exports.createPasswordResetToken = createPasswordResetToken;
const resetPasswordWithToken = async (email, token, password) => {
    const stored = resetTokens.get(token);
    if (!stored || stored.email !== email || stored.expiresAt < Date.now()) {
        throw createAuthError("Invalid or expired reset link", 400);
    }
    const user = await findUserByEmail(email);
    if (!user) {
        throw createAuthError("No account found for that email", 404);
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    if (isDatabaseReady()) {
        await user_model_1.User.updateOne({ email }, { passwordHash });
    }
    else {
        const memoryUser = user;
        memoryUsers.set(email, {
            ...memoryUser,
            passwordHash,
        });
    }
    resetTokens.delete(token);
    return { success: true };
};
exports.resetPasswordWithToken = resetPasswordWithToken;
