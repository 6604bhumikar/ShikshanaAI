
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model";

type AuthUserRecord = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  tokenVersion: number;
};

const memoryUsers = new Map<string, AuthUserRecord>();
const resetTokens = new Map<
  string,
  { email: string; expiresAt: number }
>();

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const createAuthError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

const findUserByEmail = async (email: string) => {
  if (isDatabaseReady()) {
    return User.findOne({ email });
  }

  return memoryUsers.get(email) ?? null;
};

const createUser = async (name: string, email: string, passwordHash: string, role: string) => {
  if (isDatabaseReady()) {
    return User.create({
      name,
      email,
      passwordHash,
      role,
    });
  }

  const user: AuthUserRecord = {
    _id: new mongoose.Types.ObjectId().toString(),
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
export const registerUser = async (name: string, email: string, password: string, role:string) => {
  const existing = await findUserByEmail(email);
  if (existing) throw createAuthError("Email already registered", 409);

  const hash = await bcrypt.hash(password, 12);

  const user = await createUser(name, email, hash, role);

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw createAuthError("Invalid credentials", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createAuthError("Invalid credentials", 401);

  const expiresIn = process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  const token = jwt.sign(
    { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET!,
    { expiresIn }
  );

  return { user, token };
};

export const createPasswordResetToken = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw createAuthError("No account found for that email", 404);
  }

  const token = new mongoose.Types.ObjectId().toString();
  resetTokens.set(token, {
    email,
    expiresAt: Date.now() + 1000 * 60 * 60,
  });

  return { token, email };
};

export const resetPasswordWithToken = async (
  email: string,
  token: string,
  password: string
) => {
  const stored = resetTokens.get(token);
  if (!stored || stored.email !== email || stored.expiresAt < Date.now()) {
    throw createAuthError("Invalid or expired reset link", 400);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw createAuthError("No account found for that email", 404);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (isDatabaseReady()) {
    await User.updateOne({ email }, { passwordHash });
  } else {
    const memoryUser = user as AuthUserRecord;
    memoryUsers.set(email, {
      ...memoryUser,
      passwordHash,
    });
  }

  resetTokens.delete(token);
  return { success: true };
};
