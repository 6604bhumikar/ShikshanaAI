"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const log_controller_1 = require("../controllers/log.controller");
const router = (0, express_1.Router)();
router.post("/internal/log", log_controller_1.createLog);
router.get("/logs", log_controller_1.getLogs);
exports.default = router;
