import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

/* ================= PORT ================= */

const PORT = process.env.PORT || 5001;

/* ================= DATABASE ================= */

connectDB();

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});