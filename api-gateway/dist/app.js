"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_middleware_1 = require("./middleware/jwt.middleware");
const requestId_middleware_1 = require("./middleware/requestId.middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "100mb" }));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));
app.use(requestId_middleware_1.assignRequestId);
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
}));
const proxyJson = async (req, res, targetUrl) => {
    const response = await (0, axios_1.default)({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
            "Content-Type": "application/json",
            "x-user-id": req.user?.userId,
            "x-user-role": req.user?.role,
        },
    });
    return res.status(response.status).json(response.data);
};
const proxyBinary = async (req, res, targetUrl) => {
    const response = await (0, axios_1.default)({
        method: req.method,
        url: targetUrl,
        data: req.body,
        responseType: "arraybuffer",
        headers: {
            "Content-Type": "application/json",
            "x-user-id": req.user?.userId,
            "x-user-role": req.user?.role,
        },
    });
    if (response.headers["content-type"]) {
        res.setHeader("Content-Type", response.headers["content-type"]);
    }
    if (response.headers["content-disposition"]) {
        res.setHeader("Content-Disposition", response.headers["content-disposition"]);
    }
    return res.status(response.status).send(response.data);
};
const handleAxiosError = (res, error, fallbackMessage) => {
    if (error.response) {
        const contentType = error.response.headers?.["content-type"];
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }
        return res.status(error.response.status).send(error.response.data);
    }
    return res.status(500).json({ message: fallbackMessage });
};
app.use("/api/auth", async (req, res) => {
    try {
        const targetPath = req.originalUrl.replace("/api/auth", "");
        const response = await (0, axios_1.default)({
            method: req.method,
            url: `http://localhost:5001${targetPath}`,
            data: req.body,
            headers: { "Content-Type": "application/json" },
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        handleAxiosError(res, error, "Auth service unavailable");
    }
});
app.use("/api/public", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            try {
                req.user = jsonwebtoken_1.default.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
            }
            catch {
                console.warn("[gateway] Ignoring invalid optional public auth token");
            }
        }
        const targetPath = req.originalUrl.replace("/api/public", "");
        const response = await (0, axios_1.default)({
            method: req.method,
            url: `http://localhost:5002${targetPath}`,
            data: req.body,
            headers: {
                "Content-Type": "application/json",
                "x-user-id": req.user?.userId,
            },
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        handleAxiosError(res, error, "Public content service unavailable");
    }
});
app.use(jwt_middleware_1.verifyJWT);
app.use("/api/teacher", async (req, res) => {
    try {
        const targetPath = req.originalUrl.replace("/api/teacher", "");
        await proxyJson(req, res, `http://localhost:5002${targetPath}`);
    }
    catch (error) {
        handleAxiosError(res, error, "Content service unavailable");
    }
});
app.use("/api/student", async (req, res) => {
    try {
        const path = req.originalUrl.replace("/api/student", "");
        if (path.startsWith("/enroll")) {
            return await proxyJson(req, res, `http://localhost:5004${path}`);
        }
        if (path.startsWith("/payments") ||
            path.startsWith("/orders")) {
            const targetUrl = `http://localhost:5005${path}`;
            if (path.endsWith("/invoice") || path.endsWith("/invoice/download")) {
                return await proxyBinary(req, res, targetUrl);
            }
            return await proxyJson(req, res, targetUrl);
        }
        if (path.startsWith("/certificates")) {
            const targetUrl = `http://localhost:5002${path}`;
            if (path.endsWith("/download")) {
                return await proxyBinary(req, res, targetUrl);
            }
            return await proxyJson(req, res, targetUrl);
        }
        return await proxyJson(req, res, `http://localhost:5002${path}`);
    }
    catch (error) {
        handleAxiosError(res, error, "Student route failed");
    }
});
app.use("/api/admin", async (req, res) => {
    try {
        const targetPath = req.originalUrl.replace("/api/admin", "");
        await proxyJson(req, res, `http://localhost:5003${targetPath}`);
    }
    catch (error) {
        handleAxiosError(res, error, "Admin service unavailable");
    }
});
app.use("/api/payment", async (req, res) => {
    try {
        const targetPath = req.originalUrl.replace("/api/payment", "");
        await proxyJson(req, res, `http://localhost:5005${targetPath}`);
    }
    catch (error) {
        handleAxiosError(res, error, "Payment service unavailable");
    }
});
app.use("/api/media", async (req, res) => {
    try {
        const targetPath = req.originalUrl;
        await proxyJson(req, res, `http://localhost:5006${targetPath}`);
    }
    catch (error) {
        handleAxiosError(res, error, "Media service unavailable");
    }
});
exports.default = app;
