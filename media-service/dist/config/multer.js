"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const allowedMimeTypes = new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
]);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || path_1.default.resolve(process.cwd(), "uploads");
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const safeBase = path_1.default
            .basename(file.originalname, path_1.default.extname(file.originalname))
            .replace(/[^a-zA-Z0-9-_]+/g, "-")
            .slice(0, 40) || "recording";
        const uniqueName = `${Date.now()}-${safeBase}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 500,
    },
    fileFilter: (_req, file, cb) => {
        const isAllowed = allowedMimeTypes.has(file.mimetype) || /\.(mp4|webm|mov)$/i.test(file.originalname);
        if (!isAllowed) {
            return cb(new Error("Only MP4, WEBM, and MOV video files are supported"));
        }
        return cb(null, true);
    },
});
