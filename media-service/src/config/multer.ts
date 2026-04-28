import multer from "multer";
import fs from "fs";
import path from "path";

const allowedMimeTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || path.resolve(process.cwd(), "uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeBase =
      path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .slice(0, 40) || "recording";
    const uniqueName = `${Date.now()}-${safeBase}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500,
  },
  fileFilter: (_req, file, cb) => {
    const isAllowed =
      allowedMimeTypes.has(file.mimetype) || /\.(mp4|webm|mov)$/i.test(file.originalname);

    if (!isAllowed) {
      return cb(new Error("Only MP4, WEBM, and MOV video files are supported"));
    }

    return cb(null, true);
  },
});
