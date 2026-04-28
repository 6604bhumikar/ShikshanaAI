import { Router } from "express";
import { upload } from "../config/multer";
import { uploadMedia, streamMedia } from "../controllers/media.controller";

const router = Router();

router.post("/upload", upload.single("video"), uploadMedia);
router.get("/stream/:id", streamMedia);

export default router;
