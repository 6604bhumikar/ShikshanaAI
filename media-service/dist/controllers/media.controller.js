"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamMedia = exports.uploadMedia = void 0;
const media_model_1 = require("../models/media.model");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || "http://localhost:5002";
const PUBLIC_MEDIA_BASE_URL = process.env.PUBLIC_MEDIA_BASE_URL || "http://localhost:5000/api/media";
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const extensionForMimeType = (mimeType, fileName) => {
    if (mimeType === "video/webm")
        return ".webm";
    if (mimeType === "video/mp4")
        return ".mp4";
    if (mimeType === "video/quicktime")
        return ".mov";
    return path_1.default.extname(fileName) || ".bin";
};
const ensureTeacher = (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];
    if (!teacherId || role !== "teacher") {
        res.status(403).json({ message: "Teacher access required" });
        return null;
    }
    return String(teacherId);
};
const writeBase64Upload = (fileData, fileName) => {
    const matches = fileData.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
        throw new Error("Invalid file data");
    }
    const [, mimeType, payload] = matches;
    const cleanMimeType = mimeType.split(";")[0];
    const isAllowed = ALLOWED_VIDEO_TYPES.has(cleanMimeType) || /\.(mp4|webm|mov)$/i.test(fileName);
    if (!isAllowed) {
        throw new Error("Only MP4, WEBM, and MOV video files are supported");
    }
    const uploadsDir = process.env.UPLOAD_PATH || path_1.default.resolve(process.cwd(), "uploads");
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    const safeBase = path_1.default
        .basename(fileName, path_1.default.extname(fileName))
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .slice(0, 40) || "recording";
    const savedName = `${Date.now()}-${safeBase}${extensionForMimeType(cleanMimeType, fileName)}`;
    const fullPath = path_1.default.join(uploadsDir, savedName);
    fs_1.default.writeFileSync(fullPath, Buffer.from(payload, "base64"));
    return {
        filePath: fullPath,
        mimeType: cleanMimeType,
        originalName: fileName,
    };
};
const uploadMedia = async (req, res) => {
    try {
        const teacherId = ensureTeacher(req, res);
        if (!teacherId)
            return;
        const { courseId, moduleId, lessonId, title, duration } = req.body;
        if (!courseId) {
            return res.status(400).json({ message: "Course is required" });
        }
        let uploadInfo = req.file
            ? {
                filePath: req.file.path,
                mimeType: req.file.mimetype || "",
                originalName: req.file.originalname || "",
            }
            : null;
        if (!uploadInfo && req.body.fileData) {
            uploadInfo = writeBase64Upload(String(req.body.fileData), String(req.body.fileName || "recording.webm"));
        }
        if (!uploadInfo?.filePath) {
            return res.status(400).json({ message: "No video uploaded" });
        }
        const recordingTitle = String(title || uploadInfo.originalName || "Class Recording").trim();
        const media = await media_model_1.Media.create({
            courseId,
            moduleId: moduleId || "",
            lessonId: lessonId || "standalone",
            title: recordingTitle,
            filePath: uploadInfo.filePath,
            teacherId,
            uploadedBy: teacherId,
            duration: Number(duration || 0),
            mimeType: uploadInfo.mimeType,
            originalName: uploadInfo.originalName,
        });
        const streamUrl = `${PUBLIC_MEDIA_BASE_URL}/stream/${media._id}`;
        media.videoUrl = streamUrl;
        await media.save();
        if (lessonId && lessonId !== "standalone") {
            await axios_1.default.patch(`${CONTENT_SERVICE_URL}/internal/courses/${courseId}/lessons/${lessonId}/media`, {
                contentUrl: streamUrl,
                title: recordingTitle,
            }, {
                headers: {
                    "x-user-id": teacherId,
                    "x-user-role": "teacher",
                },
            });
        }
        return res.status(201).json({ success: true, media, streamUrl });
    }
    catch (error) {
        return res.status(400).json({ message: error.message || "Upload failed" });
    }
};
exports.uploadMedia = uploadMedia;
const streamMedia = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const role = req.headers["x-user-role"];
        const media = await media_model_1.Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }
        if (role === "teacher" && userId && media.uploadedBy === userId) {
            return res.sendFile(path_1.default.resolve(media.filePath));
        }
        const enrollmentResponse = await axios_1.default.get(`${process.env.ENROLLMENT_SERVICE_URL}/internal/check/${media.courseId}`, {
            headers: { "x-user-id": userId || "" },
        });
        if (!enrollmentResponse.data.enrolled) {
            return res.status(403).json({ message: "Access denied" });
        }
        return res.sendFile(path_1.default.resolve(media.filePath));
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.streamMedia = streamMedia;
