
import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5010;

connectDB();

app.listen(PORT, () => {
  console.log(`Logging Service running on port ${PORT}`);
});
