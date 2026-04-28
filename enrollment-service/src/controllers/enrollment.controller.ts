
import { Request, Response } from "express";
import { enrollStudent } from "../services/enrollment.service";
import { Enrollment } from "../models/enrollment.model";

export const enroll = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const { courseId } = req.body;

  try {
    console.log("[enrollment] Enroll request", { studentId, courseId });
    const result = await enrollStudent(studentId, courseId);
    res.status(result.alreadyEnrolled ? 200 : 201).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
export const checkEnrollment = async (req: any, res: any) => {
  const studentId = req.headers["x-user-id"];
  const courseId = req.params.courseId;

  const enrollment = await Enrollment.findOne({
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
