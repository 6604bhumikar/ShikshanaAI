"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStudent = void 0;
const requireStudent = (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (role !== "student") {
        return res.status(403).json({ message: "Student access required" });
    }
    next();
};
exports.requireStudent = requireStudent;
