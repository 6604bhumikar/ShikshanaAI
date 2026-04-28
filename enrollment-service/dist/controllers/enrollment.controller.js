"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnrollment = exports.enroll = void 0;
const enrollment_service_1 = require("../services/enrollment.service");
const enrollment_model_1 = require("../models/enrollment.model");
const enroll = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const { courseId } = req.body;
    try {
        console.log("[enrollment] Enroll request", { studentId, courseId });
        const result = await (0, enrollment_service_1.enrollStudent)(studentId, courseId);
        res.status(result.alreadyEnrolled ? 200 : 201).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.enroll = enroll;
const checkEnrollment = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const courseId = req.params.courseId;
    const enrollment = await enrollment_model_1.Enrollment.findOne({
        studentId,
        courseId
    });
    res.json({
        enrolled: !!enrollment
    });
    console.log("[enrollment] Check enrollment", {
        studentId,
        courseId,
        enrolled: !!enrollment,
    });
};
exports.checkEnrollment = checkEnrollment;
