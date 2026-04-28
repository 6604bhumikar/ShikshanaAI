import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/auth.routes";

const app = express();

/* ================= SECURITY ================= */

app.use(helmet());

/* ================= CORS ================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ================= BODY PARSER ================= */

app.use(express.json());

/* ================= ROUTES ================= */

//app.use("/", routes);
//app.use("/api/auth", routes);
app.use("/", routes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

export default app;