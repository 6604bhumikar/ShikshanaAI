import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  createPasswordResetToken,
  loginUser,
  registerUser,
  resetPasswordWithToken,
} from "../services/auth.service";
import { registerSchema, loginSchema } from "../validators/auth.validator";

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);

    const user = await registerUser(
      parsed.name,
      parsed.email,
      parsed.password,
      parsed.role
    );

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error: any) {
    console.log("REGISTER ERROR:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { user, token } = await loginUser(parsed.email, parsed.password);
    res.json({ success: true, token, user });
  } catch (error: any) {
    console.log("LOGIN ERROR:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Login failed",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await createPasswordResetToken(String(req.body.email || ""));
    res.json({
      success: true,
      message: "Password reset link generated",
      resetUrl: `/reset-password/${result.token}?email=${encodeURIComponent(result.email)}`,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to generate reset link",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await resetPasswordWithToken(
      String(req.body.email || ""),
      String(req.body.token || ""),
      String(req.body.password || "")
    );

    res.json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to reset password",
    });
  }
};
