"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../config/multer");
const media_controller_1 = require("../controllers/media.controller");
const router = (0, express_1.Router)();
router.post("/upload", multer_1.upload.single("video"), media_controller_1.uploadMedia);
router.get("/stream/:id", media_controller_1.streamMedia);
exports.default = router;
