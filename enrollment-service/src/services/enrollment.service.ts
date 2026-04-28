import axios from "axios";
import mongoose from "mongoose";
import { Enrollment } from "../models/enrollment.model";
import { ExternalCourse } from "../models/external-course.model";

const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || "http://localhost:5002";

export const enrollStudent = async (studentId: string, courseId: string) => {
  if (!studentId) {
    throw new Error("Student authentication required");
  }

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  // 1. Verify course is published
  const courseResponse = await axios.get(
    `${CONTENT_SERVICE_URL}/internal/courses/${courseId}`
  );

  if (!courseResponse.data.success) {
    throw new Error("Course not found or not published");
  }

  const existingEnrollment = await Enrollment.findOne({
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
    const enrollment = await Enrollment.create({
      studentId,
      courseId,
    });

    if (mongoose.Types.ObjectId.isValid(courseId)) {
      await ExternalCourse.findByIdAndUpdate(courseId, {
        $inc: { enrollCount: 1 },
      });
    }

    return {
      enrollment,
      alreadyEnrolled: false,
    };
  } catch (error: any) {
    if (error?.code === 11000) {
      const enrollment = await Enrollment.findOne({
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
