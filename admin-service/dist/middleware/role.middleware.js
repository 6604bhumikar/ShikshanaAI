"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};
exports.requireAdmin = requireAdmin;
