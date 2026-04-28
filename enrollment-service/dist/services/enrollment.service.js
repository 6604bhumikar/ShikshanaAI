"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollStudent = void 0;
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const enrollment_model_1 = require("../models/enrollment.model");
const external_course_model_1 = require("../models/external-course.model");
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || "http://localhost:5002";
const enrollStudent = async (studentId, courseId) => {
    if (!studentId) {
        throw new Error("Student authentication required");
    }
    if (!courseId) {
        throw new Error("Course ID is required");
    }
    // 1. Verify course is published
    const courseResponse = await axios_1.default.get(`${CONTENT_SERVICE_URL}/internal/courses/${courseId}`);
    if (!courseResponse.data.success) {
        throw new Error("Course not found or not published");
    }
    const existingEnrollment = await enrollment_model_1.Enrollment.findOne({
        studentId,
        courseId,
    });
    if (existingEnrollment) {
        return {
            enrollment: existingEnrollment,
            alreadyEnrolled: true,
        };
    }
    try {
        const enrollment = await enrollment_model_1.Enrollment.create({
            studentId,
            courseId,
        });
        if (mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            await external_course_model_1.ExternalCourse.findByIdAndUpdate(courseId, {
                $inc: { enrollCount: 1 },
            });
        }
        return {
            enrollment,
            alreadyEnrolled: false,
        };
    }
    catch (error) {
        if (error?.code === 11000) {
            const enrollment = await enrollment_model_1.Enrollment.findOne({
                studentId,
                courseId,
            });
            if (enrollment) {
                return {
                    enrollment,
                    alreadyEnrolled: true,
                };
            }
        }
        throw error;
    }
};
exports.enrollStudent = enrollStudent;
