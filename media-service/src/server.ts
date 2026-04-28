import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import mediaRoutes from "./routes/media.routes";

dotenv.config();

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use("/api/media", mediaRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log("Media DB connected"))
  .catch(err => console.error("DB error", err));

app.listen(process.env.PORT, () => {
  console.log(`Media Service running on port ${process.env.PORT}`);
});
