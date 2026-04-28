
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import routes from "./routes/log.routes";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/", routes);

export default app;
