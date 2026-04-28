
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5005;

connectDB();

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
