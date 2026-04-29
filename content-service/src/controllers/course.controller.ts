import { Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";
import { Course } from "../models/course.model";
import { Enrollment, Payment } from "../models/dashboard.model";
import { Certificate } from "../models/certificate.model";
import { Quiz, QuizAttempt } from "../models/quiz.model";
import { ExternalUser } from "../models/external-user.model";
import { Review } from "../models/review.model";
import { createCourseSchema } from "../validators/course.validator";
import { decorateUnitsForStudent, calculateQuizCountMap } from "./learning.controller";

const ENROLLMENT_SERVICE_URL = process.env.ENROLLMENT_SERVICE_URL || "http://localhost:5004";

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const buildSimplePdfBuffer = (lines: string[]) => {
  const content = `BT /F1 20 Tf 50 760 Td ${lines
    .map((line, index) =>
      `${index === 0 ? "" : "T* "}(${escapePdfText(line)}) Tj`
    )
    .join(" ")} ET`;

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(content, "utf8")} >> stream\n${content}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
};

const buildCertificatePdf = (certificate: any) =>
  buildSimplePdfBuffer([
    "Shikshana Certificate of Completion",
    "",
    `Certificate ID: ${certificate.certificateId}`,
    `Course: ${certificate.courseTitle}`,
    `Issued: ${new Date(certificate.issuedAt).toLocaleDateString("en-IN")}`,
    "Verified by Shikshana LMS",
  ]);

const getFinalQuiz = async (courseId: string) =>
  (await Quiz.findOne({ courseId, unitId: null, kind: "final" }).lean()) as any;

const hasFinalQuizQuestions = (quiz: any) =>
  Boolean(quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0);

const getLatestPassedFinalAttempt = async (studentId: string, courseId: string) =>
  QuizAttempt.findOne({
    studentId,
    courseId,
    unitId: null,
    kind: "final",
    passed: true,
  })
    .sort({ createdAt: -1 })
    .lean();

const ensureCertificateForCourse = async (studentId: string, courseId: string) => {
  const course = (await Course.findById(courseId).lean()) as any;
  if (!course) return null;

  const enrollment = (await Enrollment.findOne({ studentId, courseId }).lean()) as any;
  if (!enrollment) return null;

  const finalQuiz = await getFinalQuiz(courseId);
  const finalQuizRequired = hasFinalQuizQuestions(finalQuiz);
  const passedFinalQuiz = finalQuizRequired
    ? Boolean(await getLatestPassedFinalAttempt(studentId, courseId))
    : false;
  const completedCourse = Boolean(enrollment.completed) || Number(enrollment.progress || 0) >= 100;

  if (!passedFinalQuiz && !(!finalQuizRequired && completedCourse)) {
    return null;
  }

  let certificate = (await Certificate.findOne({ studentId, courseId })) as any;
  if (!certificate) {
    certificate = await Certificate.create({
      studentId,
      courseId,
      courseTitle: course.title,
      certificateId: `CERT-${String(courseId).slice(-6).toUpperCase()}-${Date.now()
        .toString()
        .slice(-6)}`,
      filePath: "",
    });
  }

  if (!certificate.filePath) {
    certificate.filePath = `/api/student/certificates/${certificate._id}/download`;
    await certificate.save();
  }

  return certificate;
};

const buildInvoiceHtml = (payment: any) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${payment.invoiceNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
      .header { display:flex; justify-content:space-between; margin-bottom:24px; }
      .card { border:1px solid #e5e7eb; border-radius:16px; padding:24px; }
      .row { display:flex; justify-content:space-between; margin:12px 0; }
      .muted { color:#6b7280; }
      .total { font-size:20px; font-weight:bold; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>Invoice</h1>
        <div class="muted">Shikshana LMS</div>
      </div>
      <div>
        <div><strong>${payment.invoiceNumber}</strong></div>
        <div class="muted">${new Date(payment.createdAt).toLocaleDateString("en-IN")}</div>
      </div>
    </div>
    <div class="card">
      <div class="row"><span>Course</span><strong>${payment.course?.title || "Course purchase"}</strong></div>
      <div class="row"><span>Status</span><strong>${payment.status}</strong></div>
      <div class="row"><span>Payment Method</span><strong>${payment.paymentMethod || "online"}</strong></div>
      <div class="row total"><span>Total</span><span>INR ${Number(payment.amount || 0).toLocaleString("en-IN")}</span></div>
    </div>
  </body>
</html>`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "course";

const ensureUniqueSlug = async (base: string, excludeId?: string) => {
  let slug = slugify(base);
  let counter = 1;

  while (
    await Course.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    counter += 1;
    slug = `${slugify(base)}-${counter}`;
  }

  return slug;
};

const normalizePrice = (value: unknown) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

const teacherContentStatuses = ["draft", "rejected", "review", "published"];

const toCourseSummary = (course: any) => ({
  _id: course._id,
  title: course.title,
  description: course.description || "",
  category: course.category || "",
  price: Number(course.price || 0),
  isFree: Boolean(course.isFree),
  isSequential: course.isSequential !== false,
  thumbnail: course.thumbnail || "",
  language: course.language || "English",
  status: course.status,
  slug: course.slug,
  updatedAt: course.updatedAt,
  createdAt: course.createdAt,
  units: (course.units || []).map((unit: any) => ({
    _id: unit._id,
    title: unit.title,
    order: unit.order,
    lessons: unit.lessons || [],
    quizCount: (unit.lessons || []).filter((lesson: any) => lesson.type === "quiz").length,
  })),
});

const getEnrollmentStatus = async (studentId: string | undefined, courseId: string) => {
  if (!studentId) return false;

  const enrollment = await Enrollment.findOne({ studentId, courseId }).lean();
  return Boolean(enrollment);
};

const getTeacherMap = async (teacherIds: string[]) => {
  if (!teacherIds.length) return new Map<string, any>();

  const teachers = await ExternalUser.find({ _id: { $in: teacherIds } }).lean();
  return new Map(teachers.map((teacher: any) => [String(teacher._id), teacher]));
};

const findCourseForRequest = async (identifier: string, role?: string, teacherId?: string) => {
  const queries: any[] = [];

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    queries.push({ _id: identifier });
  }

  queries.push({ slug: identifier });

  const baseFilter =
    role === "teacher" && teacherId ? { teacherId } : { status: "published" };

  return Course.findOne({
    ...baseFilter,
    $or: queries,
  });
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const parsed = createCourseSchema.parse(req.body);
    const teacherId = req.headers["x-user-id"] as string;
    const title = parsed.title.trim();
    const isFree = parsed.isFree ?? normalizePrice(parsed.price) <= 0;

    const course = await Course.create({
      ...parsed,
      title,
      teacherId,
      slug: await ensureUniqueSlug(parsed.slug || title),
      price: isFree ? 0 : normalizePrice(parsed.price),
      isFree,
      isSequential: parsed.isSequential !== false,
      units: [],
    });

    return res.status(201).json({ success: true, course });
  } catch (error: any) {
    const message =
      error?.issues?.[0]?.message ||
      error?.errors?.[0]?.message ||
      error?.message ||
      "Failed to create course";
    console.error("Create course failed:", message);
    return res.status(400).json({ message });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  const role = req.headers["x-user-role"] as string | undefined;
  const teacherId = req.headers["x-user-id"] as string | undefined;

  if (role === "teacher" && teacherId) {
    const courses = await Course.find({ teacherId }).sort({ updatedAt: -1 }).lean();
    return res.json(courses.map(toCourseSummary));
  }

  const courses = await Course.find({ status: "published" }).sort({ createdAt: -1 }).lean();
  return res.json({
    success: true,
    courses: courses.map((course: any) => ({
      ...toCourseSummary(course),
      teacherName: "Expert Instructor",
    })),
  });
};

export const getCourseDetails = async (req: Request, res: Response) => {
  const role = req.headers["x-user-role"] as string | undefined;
  const teacherId = req.headers["x-user-id"] as string | undefined;
  const studentId = req.headers["x-user-id"] as string | undefined;
  const identifier = req.params.idOrSlug;

  const course = await findCourseForRequest(identifier, role, teacherId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (role === "teacher" && teacherId) {
    const quizCountMap = await calculateQuizCountMap(String(course._id));
    const summary = toCourseSummary(course.toObject());
    return res.json({
      ...summary,
      units: summary.units.map((unit: any) => ({
        ...unit,
        quizCount: quizCountMap.get(String(unit._id)) || unit.quizCount || 0,
      })),
    });
  }

  const teacher = (await ExternalUser.findById(course.teacherId).lean()) as any;
  const enrolled = await getEnrollmentStatus(studentId, String(course._id));
  const totalLessons = (course.units || []).reduce(
    (sum: number, unit: any) => sum + ((unit.lessons || []).length || 0),
    0
  );

  return res.json({
    course: {
      ...toCourseSummary(course.toObject()),
      teacher: teacher
        ? {
            name: teacher.name,
            email: teacher.email,
            isVerified: Boolean((teacher as any).isVerified),
          }
        : null,
      teacherName: teacher?.name || "Expert Instructor",
    },
    meta: {
      category: course.category || "General",
      students: Number(course.enrollCount || 0),
      totalLessons,
    },
    access: {
      isFree: Boolean(course.isFree),
      price: Number(course.price || 0),
      enrolled,
    },
  });
};

export const updateCourse = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await Course.findOne({
    _id: req.params.id,
    teacherId,
    status: { $in: ["draft", "rejected"] },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found or not editable" });
  }

  const parsed = createCourseSchema.partial().parse(req.body);

  if (parsed.title) {
    course.title = parsed.title.trim();
    course.slug = await ensureUniqueSlug(parsed.slug || parsed.title, String(course._id));
  } else if (parsed.slug) {
    course.slug = await ensureUniqueSlug(parsed.slug, String(course._id));
  }

  if (parsed.description !== undefined) course.description = parsed.description;
  if (parsed.category !== undefined) course.category = parsed.category;
  if (parsed.thumbnail !== undefined) course.thumbnail = parsed.thumbnail;
  if (parsed.language !== undefined) course.language = parsed.language;
  if (parsed.isSequential !== undefined) course.isSequential = parsed.isSequential;

  const isFree = parsed.isFree ?? course.isFree ?? normalizePrice(parsed.price ?? course.price) <= 0;
  course.isFree = isFree;
  course.price = isFree ? 0 : normalizePrice(parsed.price ?? course.price);

  await course.save();

  return res.json({ success: true, course });
};

export const deleteCourse = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;

  const course = await Course.findOneAndDelete({
    _id: req.params.id,
    teacherId,
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.json({ success: true });
};

export const submitForReview = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;

  const course = await Course.findOne({
    _id: req.params.id,
    teacherId,
    status: { $in: ["draft", "rejected"] },
  });

  if (!course) {
    return res.status(400).json({ message: "Invalid editable course" });
  }

  course.status = "review";
  await course.save();

  return res.json({ success: true, course });
};

export const updateCourseStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!["published", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  course.status = status;
  await course.save();

  return res.json({ success: true, course });
};

export const addUnit = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { title } = req.body;

  const course = await Course.findOne({
    _id: req.params.courseId || req.params.id,
    teacherId,
    status: { $in: teacherContentStatuses },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found or not editable" });
  }

  course.units.push({
    title,
    order: course.units.length + 1,
    lessons: [],
  } as any);

  await course.save();

  return res.json({ success: true, course });
};

export const getUnits = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await Course.findOne({
    _id: req.params.courseId,
    teacherId,
  }).lean();

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const quizCountMap = await calculateQuizCountMap(String(course._id));
  return res.json({
    courseTitle: course.title,
    units: (course.units || []).map((unit: any) => ({
      ...unit,
      quizCount: quizCountMap.get(String(unit._id)) || 0,
    })),
  });
};

export const deleteUnit = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await Course.findOne({
    _id: req.params.courseId,
    teacherId,
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const unit = course.units.id(req.params.unitId);
  if (!unit) {
    return res.status(404).json({ message: "Unit not found" });
  }

  unit.deleteOne();
  await course.save();

  return res.json({ success: true });
};

export const addLesson = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { title, type, contentUrl, textContent, duration, isPreview } = req.body;

  const course = await Course.findOne({
    _id: req.params.courseId,
    teacherId,
    status: { $in: teacherContentStatuses },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const unit = course.units.id(req.params.unitId);
  if (!unit) {
    return res.status(404).json({ message: "Unit not found" });
  }

  unit.lessons.push({
    title,
    type,
    contentUrl: contentUrl || undefined,
    textContent: textContent || undefined,
    duration: normalizePrice(duration),
    order: unit.lessons.length + 1,
    isPreview: Boolean(isPreview),
  } as any);

  await course.save();

  return res.json({ success: true, course });
};

export const attachLessonMedia = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { contentUrl, title, duration } = req.body;

  if (!contentUrl) {
    return res.status(400).json({ message: "Media URL is required" });
  }

  const course = await Course.findOne({
    _id: req.params.courseId,
    teacherId,
    status: { $in: teacherContentStatuses },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  let targetLesson: any = null;
  for (const unit of course.units as any[]) {
    const lesson = unit.lessons.id(req.params.lessonId);
    if (lesson) {
      targetLesson = lesson;
      break;
    }
  }

  if (!targetLesson) {
    return res.status(404).json({ message: "Lesson not found" });
  }

  targetLesson.type = "video";
  targetLesson.contentUrl = contentUrl;
  targetLesson.textContent = undefined;
  if (title) {
    targetLesson.title = String(title).trim();
  }
  if (duration !== undefined) {
    targetLesson.duration = normalizePrice(duration);
  }

  await course.save();

  return res.json({ success: true, lesson: targetLesson });
};

export const getLessons = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await Course.findOne({
    _id: req.params.courseId,
    teacherId,
  }).lean();

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const unit = (course.units || []).find((item: any) => String(item._id) === req.params.unitId);
  if (!unit) {
    return res.status(404).json({ message: "Unit not found" });
  }

  return res.json({ lessons: unit.lessons || [] });
};

export const deleteLesson = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await Course.findOne({
    _id: req.params.courseId,
    teacherId,
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const unit = course.units.id(req.params.unitId);
  if (!unit) {
    return res.status(404).json({ message: "Unit not found" });
  }

  const lessonIndex = Number(req.params.lessonIndex);
  if (!Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= unit.lessons.length) {
    return res.status(400).json({ message: "Invalid lesson index" });
  }

  unit.lessons.splice(lessonIndex, 1);
  await course.save();

  return res.json({ success: true });
};

export const getCourseReviews = async (_req: Request, res: Response) => {
  const courseId = (_req.params as any).idOrSlug || (_req.params as any).courseId;
  const course = await findCourseForRequest(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const reviews = await Review.find({ courseId: String(course._id) })
    .sort({ createdAt: -1 })
    .lean();
  const studentIds = Array.from(
    new Set(reviews.map((review: any) => String(review.studentId)).filter(Boolean))
  );
  const students = studentIds.length
    ? ((await ExternalUser.find({ _id: { $in: studentIds } }).lean()) as any[])
    : [];
  const studentMap = new Map(students.map((student: any) => [String(student._id), student]));

  return res.json({
    reviews: reviews.map((review: any) => ({
      ...review,
      student: studentMap.get(String(review.studentId))
        ? {
            name: studentMap.get(String(review.studentId)).name,
            email: studentMap.get(String(review.studentId)).email,
          }
        : { name: "Student" },
    })),
    avgRating: Number(course.ratingAvg || 0),
    totalReviews: reviews.length,
  });
};

export const getStudentCoursePlayer = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.headers["x-user-id"] as string | undefined;

    const course = await Course.findOne({
      _id: courseId,
      status: "published",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!studentId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const enrollmentResponse = await axios.get(
      `${ENROLLMENT_SERVICE_URL}/internal/check/${courseId}`,
      {
        headers: {
          "x-user-id": studentId,
        },
      }
    );

    const enrolled = Boolean((enrollmentResponse.data as any).enrolled);
    if (enrolled) {
      const decorated = await decorateUnitsForStudent(course.toObject(), studentId);
      const finalQuiz = await getFinalQuiz(courseId);
      return res.json({
        success: true,
        course: {
          ...course.toObject(),
          finalQuizAvailable: hasFinalQuizQuestions(finalQuiz),
          finalQuizUnlocked: decorated.finalQuizUnlocked,
        },
        units: decorated.units,
      });
    }

    return res.status(403).json({
      message: course.isFree
        ? "Please enroll in this course before starting learning"
        : "Please purchase this course before starting learning",
    });
  } catch (error) {
    console.error("Player Route Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const sumLessonDurationHours = (course: any) => {
  const totalSeconds = (course.units || []).reduce((unitSum: number, unit: any) => {
    const lessonSeconds = (unit.lessons || []).reduce(
      (lessonSum: number, lesson: any) => lessonSum + Number(lesson.duration || 0),
      0
    );

    return unitSum + lessonSeconds;
  }, 0);

  return totalSeconds / 3600;
};

const formatRelativeTime = (value?: Date) => {
  if (!value) return "Recently updated";

  const now = Date.now();
  const diffMs = now - new Date(value).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
};

export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    const studentId = req.headers["x-user-id"] as string;

    if (!studentId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const enrollments = await Enrollment.find({ studentId })
      .sort({ updatedAt: -1 })
      .lean();

    const courseIds = enrollments.map((enrollment: any) => enrollment.courseId);
    const courses = courseIds.length
      ? await Course.find({ _id: { $in: courseIds } }).lean()
      : [];

    const courseMap = new Map(courses.map((course: any) => [String(course._id), course]));

    const enrolledCourses = enrollments
      .map((enrollment: any) => {
        const course = courseMap.get(String(enrollment.courseId));
        if (!course) return null;

        return {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail || "",
          instructor: "Instructor",
          progress: Number(enrollment.progress || 0),
          completed: Boolean(enrollment.completed),
          lastAccessed: enrollment.updatedAt || enrollment.createdAt,
        };
      })
      .filter(Boolean);

    const completedCourses = enrolledCourses.filter((course: any) => course.completed);
    const learningHours = enrolledCourses.reduce((total: number, enrolledCourse: any) => {
      const fullCourse = courseMap.get(String(enrolledCourse._id));
      if (!fullCourse) return total;

      const totalHours = sumLessonDurationHours(fullCourse);
      return total + totalHours * (Number(enrolledCourse.progress || 0) / 100);
    }, 0);

    const payments = await Payment.find({
      studentId,
      status: { $in: ["success", "paid"] },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentOrders = payments.map((payment: any) => ({
      _id: payment._id,
      courseTitle: courseMap.get(String(payment.courseId))?.title || "Course purchase",
      amount: Number(payment.amount || 0),
      status: payment.status === "success" ? "paid" : payment.status,
      createdAt: payment.createdAt,
    }));

    const certificates = completedCourses.slice(0, 5).map((course: any) => ({
      _id: String(course._id),
      courseTitle: course.title,
      issuedAt: course.lastAccessed,
    }));

    return res.json({
      stats: {
        enrolled: enrolledCourses.length,
        completed: completedCourses.length,
        hours: Math.round(learningHours),
      },
      enrolledCourses,
      recentOrders,
      certificates,
    });
  } catch (error) {
    console.error("Student dashboard load failed", error);
    return res.status(500).json({ message: "Failed to load student dashboard" });
  }
};

export const getTeacherDashboardSummary = async (req: Request, res: Response) => {
  try {
    const teacherId = req.headers["x-user-id"] as string;

    if (!teacherId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const courses = await Course.find({ teacherId }).sort({ updatedAt: -1 }).lean();
    const courseIds = courses.map((course: any) => String(course._id));

    const enrollments = courseIds.length
      ? await Enrollment.find({ courseId: { $in: courseIds } }).lean()
      : [];

    const uniqueStudents = new Set(
      enrollments.map((enrollment: any) => String(enrollment.studentId))
    );

    const recentCourses = courses.slice(0, 5).map((course: any) => ({
      _id: course._id,
      title: course.title,
      updatedAgo: formatRelativeTime(course.updatedAt),
    }));

    const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date();
      monthDate.setDate(1);
      monthDate.setMonth(monthDate.getMonth() - (5 - index));

      return {
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        month: monthDate.toLocaleString("en-US", { month: "short" }),
        count: 0,
      };
    });

    const chartMap = new Map(lastSixMonths.map((item) => [item.key, item]));

    enrollments.forEach((enrollment: any) => {
      const createdAt = enrollment.createdAt ? new Date(enrollment.createdAt) : null;
      if (!createdAt) return;

      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const bucket = chartMap.get(key);
      if (bucket) {
        bucket.count += 1;
      }
    });

    const avgRating =
      courses.length > 0
        ? Number(
            (
              courses.reduce((sum: number, course: any) => sum + Number(course.ratingAvg || 0), 0) /
              courses.length
            ).toFixed(1)
          )
        : 0;

    return res.json({
      summary: {
        coursesCreated: courses.length,
        activeStudents: uniqueStudents.size,
        courseCompletions: enrollments.filter((item: any) => item.completed).length,
        avgRating,
        communitiesCreated: 0,
      },
      chartData: lastSixMonths,
      recentCourses,
    });
  } catch (error) {
    console.error("Teacher dashboard load failed", error);
    return res.status(500).json({ message: "Failed to load teacher dashboard" });
  }
};

export const listCertificates = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  if (!studentId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const enrollments = await Enrollment.find({ studentId }).lean();
  for (const enrollment of enrollments as any[]) {
    await ensureCertificateForCourse(studentId, String(enrollment.courseId));
  }

  const certificates = await Certificate.find({ studentId }).sort({ issuedAt: -1 }).lean();
  return res.json({ certificates });
};

export const generateCertificate = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const courseId = req.params.courseId;

  if (!studentId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const certificate = await ensureCertificateForCourse(studentId, courseId);
  if (!certificate) {
    return res.status(403).json({
      message:
        "Certificate is not available yet. Complete the course or pass the final quiz first.",
    });
  }

  return res.json({ success: true, certificate });
};

export const downloadCertificate = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const certificate = (await Certificate.findOne({
    _id: req.params.id,
    studentId,
  }).lean()) as any;

  if (!certificate) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  const buffer = buildCertificatePdf(certificate);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${certificate.courseTitle.replace(/\s+/g, "_")}_certificate.pdf"`
  );

  return res.send(buffer);
};

export const getPublishedCourseById = async (req: Request, res: Response) => {
  const course = await Course.findOne({
    _id: req.params.id,
    status: "published",
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  return res.json({ success: true, course });
};

export const getInvoiceHtmlForCourse = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const payment = (await Payment.findOne({
    _id: req.params.id,
    studentId,
  }).lean()) as any;

  if (!payment) {
    return res.status(404).json({ message: "Order not found" });
  }

  const course = (await Course.findById(payment.courseId).lean()) as any;
  const invoice = {
    ...payment,
    invoiceNumber: `INV-${String(payment._id).slice(-6).toUpperCase()}`,
    course,
    paymentMethod: payment.amount > 0 ? "online" : "free",
  };

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(buildInvoiceHtml(invoice));
};
