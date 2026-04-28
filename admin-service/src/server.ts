
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5003;

connectDB();

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
