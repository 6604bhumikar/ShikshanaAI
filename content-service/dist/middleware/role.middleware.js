"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeacher = void 0;
const requireTeacher = (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (role !== "teacher") {
        return res.status(403).json({ message: "Teacher access required" });
    }
    next();
    console.log("Role received:", role);
};
exports.requireTeacher = requireTeacher;
