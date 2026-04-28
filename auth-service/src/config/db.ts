import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Auth DB connected");
  } catch (err) {
    console.error("DB connection failed", err);
    console.log("Continuing without database connection for development...");
    // Don't exit process, continue without DB for testing
  }
};
console.log("Connecting to:", process.env.MONGO_URI);