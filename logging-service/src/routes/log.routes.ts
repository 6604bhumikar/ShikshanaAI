
import { Router } from "express";
import { createLog, getLogs } from "../controllers/log.controller";

const router = Router();

router.post("/internal/log", createLog);
router.get("/logs", getLogs);

export default router;
