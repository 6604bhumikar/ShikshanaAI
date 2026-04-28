
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/course.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/", routes);

export default app;
