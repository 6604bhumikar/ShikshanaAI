"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoiceHtmlForCourse = exports.getPublishedCourseById = exports.downloadCertificate = exports.generateCertificate = exports.listCertificates = exports.getTeacherDashboardSummary = exports.getStudentDashboard = exports.getStudentCoursePlayer = exports.getCourseReviews = exports.deleteLesson = exports.getLessons = exports.attachLessonMedia = exports.addLesson = exports.deleteUnit = exports.getUnits = exports.addUnit = exports.updateCourseStatus = exports.submitForReview = exports.deleteCourse = exports.updateCourse = exports.getCourseDetails = exports.getCourses = exports.createCourse = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const course_model_1 = require("../models/course.model");
const dashboard_model_1 = require("../models/dashboard.model");
const certificate_model_1 = require("../models/certificate.model");
const external_user_model_1 = require("../models/external-user.model");
const review_model_1 = require("../models/review.model");
const course_validator_1 = require("../validators/course.validator");
const learning_controller_1 = require("./learning.controller");
const ENROLLMENT_SERVICE_URL = process.env.ENROLLMENT_SERVICE_URL || "http://localhost:5004";
const escapePdfText = (value) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const buildSimplePdfBuffer = (lines) => {
    const content = `BT /F1 20 Tf 50 760 Td ${lines
        .map((line, index) => `${index === 0 ? "" : "T* "}(${escapePdfText(line)}) Tj`)
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
const buildCertificatePdf = (certificate) => buildSimplePdfBuffer([
    "Shikshana Certificate of Completion",
    "",
    `Certificate ID: ${certificate.certificateId}`,
    `Course: ${certificate.courseTitle}`,
    `Issued: ${new Date(certificate.issuedAt).toLocaleDateString("en-IN")}`,
    "Verified by Shikshana LMS",
]);
const buildInvoiceHtml = (payment) => `<!doctype html>
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
const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "course";
const ensureUniqueSlug = async (base, excludeId) => {
    let slug = slugify(base);
    let counter = 1;
    while (await course_model_1.Course.findOne({
        slug,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })) {
        counter += 1;
        slug = `${slugify(base)}-${counter}`;
    }
    return slug;
};
const normalizePrice = (value) => {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount : 0;
};
const teacherContentStatuses = ["draft", "rejected", "review", "published"];
const toCourseSummary = (course) => ({
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
    units: (course.units || []).map((unit) => ({
        _id: unit._id,
        title: unit.title,
        order: unit.order,
        lessons: unit.lessons || [],
        quizCount: (unit.lessons || []).filter((lesson) => lesson.type === "quiz").length,
    })),
});
const getEnrollmentStatus = async (studentId, courseId) => {
    if (!studentId)
        return false;
    const enrollment = await dashboard_model_1.Enrollment.findOne({ studentId, courseId }).lean();
    return Boolean(enrollment);
};
const getTeacherMap = async (teacherIds) => {
    if (!teacherIds.length)
        return new Map();
    const teachers = await external_user_model_1.ExternalUser.find({ _id: { $in: teacherIds } }).lean();
    return new Map(teachers.map((teacher) => [String(teacher._id), teacher]));
};
const findCourseForRequest = async (identifier, role, teacherId) => {
    const queries = [];
    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
        queries.push({ _id: identifier });
    }
    queries.push({ slug: identifier });
    const baseFilter = role === "teacher" && teacherId ? { teacherId } : { status: "published" };
    return course_model_1.Course.findOne({
        ...baseFilter,
        $or: queries,
    });
};
const createCourse = async (req, res) => {
    try {
        const parsed = course_validator_1.createCourseSchema.parse(req.body);
        const teacherId = req.headers["x-user-id"];
        const title = parsed.title.trim();
        const isFree = parsed.isFree ?? normalizePrice(parsed.price) <= 0;
        const course = await course_model_1.Course.create({
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
    }
    catch (error) {
        const message = error?.issues?.[0]?.message ||
            error?.errors?.[0]?.message ||
            error?.message ||
            "Failed to create course";
        console.error("Create course failed:", message);
        return res.status(400).json({ message });
    }
};
exports.createCourse = createCourse;
const getCourses = async (req, res) => {
    const role = req.headers["x-user-role"];
    const teacherId = req.headers["x-user-id"];
    if (role === "teacher" && teacherId) {
        const courses = await course_model_1.Course.find({ teacherId }).sort({ updatedAt: -1 }).lean();
        return res.json(courses.map(toCourseSummary));
    }
    const courses = await course_model_1.Course.find({ status: "published" }).sort({ createdAt: -1 }).lean();
    return res.json({
        success: true,
        courses: courses.map((course) => ({
            ...toCourseSummary(course),
            teacherName: "Expert Instructor",
        })),
    });
};
exports.getCourses = getCourses;
const getCourseDetails = async (req, res) => {
    const role = req.headers["x-user-role"];
    const teacherId = req.headers["x-user-id"];
    const studentId = req.headers["x-user-id"];
    const identifier = req.params.idOrSlug;
    const course = await findCourseForRequest(identifier, role, teacherId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (role === "teacher" && teacherId) {
        const quizCountMap = await (0, learning_controller_1.calculateQuizCountMap)(String(course._id));
        const summary = toCourseSummary(course.toObject());
        return res.json({
            ...summary,
            units: summary.units.map((unit) => ({
                ...unit,
                quizCount: quizCountMap.get(String(unit._id)) || unit.quizCount || 0,
            })),
        });
    }
    const teacher = (await external_user_model_1.ExternalUser.findById(course.teacherId).lean());
    const enrolled = await getEnrollmentStatus(studentId, String(course._id));
    const totalLessons = (course.units || []).reduce((sum, unit) => sum + ((unit.lessons || []).length || 0), 0);
    return res.json({
        course: {
            ...toCourseSummary(course.toObject()),
            teacher: teacher
                ? {
                    name: teacher.name,
                    email: teacher.email,
                    isVerified: Boolean(teacher.isVerified),
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
exports.getCourseDetails = getCourseDetails;
const updateCourse = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOne({
        _id: req.params.id,
        teacherId,
        status: { $in: ["draft", "rejected"] },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found or not editable" });
    }
    const parsed = course_validator_1.createCourseSchema.partial().parse(req.body);
    if (parsed.title) {
        course.title = parsed.title.trim();
        course.slug = await ensureUniqueSlug(parsed.slug || parsed.title, String(course._id));
    }
    else if (parsed.slug) {
        course.slug = await ensureUniqueSlug(parsed.slug, String(course._id));
    }
    if (parsed.description !== undefined)
        course.description = parsed.description;
    if (parsed.category !== undefined)
        course.category = parsed.category;
    if (parsed.thumbnail !== undefined)
        course.thumbnail = parsed.thumbnail;
    if (parsed.language !== undefined)
        course.language = parsed.language;
    if (parsed.isSequential !== undefined)
        course.isSequential = parsed.isSequential;
    const isFree = parsed.isFree ?? course.isFree ?? normalizePrice(parsed.price ?? course.price) <= 0;
    course.isFree = isFree;
    course.price = isFree ? 0 : normalizePrice(parsed.price ?? course.price);
    await course.save();
    return res.json({ success: true, course });
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOneAndDelete({
        _id: req.params.id,
        teacherId,
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    return res.json({ success: true });
};
exports.deleteCourse = deleteCourse;
const submitForReview = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOne({
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
exports.submitForReview = submitForReview;
const updateCourseStatus = async (req, res) => {
    const { status } = req.body;
    if (!["published", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }
    const course = await course_model_1.Course.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    course.status = status;
    await course.save();
    return res.json({ success: true, course });
};
exports.updateCourseStatus = updateCourseStatus;
const addUnit = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const { title } = req.body;
    const course = await course_model_1.Course.findOne({
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
    });
    await course.save();
    return res.json({ success: true, course });
};
exports.addUnit = addUnit;
const getUnits = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOne({
        _id: req.params.courseId,
        teacherId,
    }).lean();
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const quizCountMap = await (0, learning_controller_1.calculateQuizCountMap)(String(course._id));
    return res.json({
        courseTitle: course.title,
        units: (course.units || []).map((unit) => ({
            ...unit,
            quizCount: quizCountMap.get(String(unit._id)) || 0,
        })),
    });
};
exports.getUnits = getUnits;
const deleteUnit = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOne({
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
exports.deleteUnit = deleteUnit;
const addLesson = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const { title, type, contentUrl, textContent, duration, isPreview } = req.body;
    const course = await course_model_1.Course.findOne({
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
    });
    await course.save();
    return res.json({ success: true, course });
};
exports.addLesson = addLesson;
const attachLessonMedia = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const { contentUrl, title } = req.body;
    if (!contentUrl) {
        return res.status(400).json({ message: "Media URL is required" });
    }
    const course = await course_model_1.Course.findOne({
        _id: req.params.courseId,
        teacherId,
        status: { $in: teacherContentStatuses },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    let targetLesson = null;
    for (const unit of course.units) {
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
    await course.save();
    return res.json({ success: true, lesson: targetLesson });
};
exports.attachLessonMedia = attachLessonMedia;
const getLessons = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOne({
        _id: req.params.courseId,
        teacherId,
    }).lean();
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const unit = (course.units || []).find((item) => String(item._id) === req.params.unitId);
    if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
    }
    return res.json({ lessons: unit.lessons || [] });
};
exports.getLessons = getLessons;
const deleteLesson = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOne({
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
exports.deleteLesson = deleteLesson;
const getCourseReviews = async (_req, res) => {
    const courseId = _req.params.idOrSlug || _req.params.courseId;
    const course = await findCourseForRequest(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const reviews = await review_model_1.Review.find({ courseId: String(course._id) })
        .sort({ createdAt: -1 })
        .lean();
    const studentIds = Array.from(new Set(reviews.map((review) => String(review.studentId)).filter(Boolean)));
    const students = studentIds.length
        ? (await external_user_model_1.ExternalUser.find({ _id: { $in: studentIds } }).lean())
        : [];
    const studentMap = new Map(students.map((student) => [String(student._id), student]));
    return res.json({
        reviews: reviews.map((review) => ({
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
exports.getCourseReviews = getCourseReviews;
const getStudentCoursePlayer = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.headers["x-user-id"];
        const course = await course_model_1.Course.findOne({
            _id: courseId,
            status: "published",
        });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (!studentId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const enrollmentResponse = await axios_1.default.get(`${ENROLLMENT_SERVICE_URL}/internal/check/${courseId}`, {
            headers: {
                "x-user-id": studentId,
            },
        });
        const enrolled = Boolean(enrollmentResponse.data.enrolled);
        if (enrolled) {
            const decorated = await (0, learning_controller_1.decorateUnitsForStudent)(course.toObject(), studentId);
            return res.json({
                success: true,
                course: {
                    ...course.toObject(),
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
    }
    catch (error) {
        console.error("Player Route Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getStudentCoursePlayer = getStudentCoursePlayer;
const sumLessonDurationHours = (course) => {
    const totalSeconds = (course.units || []).reduce((unitSum, unit) => {
        const lessonSeconds = (unit.lessons || []).reduce((lessonSum, lesson) => lessonSum + Number(lesson.duration || 0), 0);
        return unitSum + lessonSeconds;
    }, 0);
    return totalSeconds / 3600;
};
const formatRelativeTime = (value) => {
    if (!value)
        return "Recently updated";
    const now = Date.now();
    const diffMs = now - new Date(value).getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    if (diffDays === 0)
        return "Today";
    if (diffDays === 1)
        return "1 day ago";
    if (diffDays < 30)
        return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1)
        return "1 month ago";
    if (diffMonths < 12)
        return `${diffMonths} months ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
};
const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.headers["x-user-id"];
        if (!studentId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const enrollments = await dashboard_model_1.Enrollment.find({ studentId })
            .sort({ updatedAt: -1 })
            .lean();
        const courseIds = enrollments.map((enrollment) => enrollment.courseId);
        const courses = courseIds.length
            ? await course_model_1.Course.find({ _id: { $in: courseIds } }).lean()
            : [];
        const courseMap = new Map(courses.map((course) => [String(course._id), course]));
        const enrolledCourses = enrollments
            .map((enrollment) => {
            const course = courseMap.get(String(enrollment.courseId));
            if (!course)
                return null;
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
        const completedCourses = enrolledCourses.filter((course) => course.completed);
        const learningHours = enrolledCourses.reduce((total, enrolledCourse) => {
            const fullCourse = courseMap.get(String(enrolledCourse._id));
            if (!fullCourse)
                return total;
            const totalHours = sumLessonDurationHours(fullCourse);
            return total + totalHours * (Number(enrolledCourse.progress || 0) / 100);
        }, 0);
        const payments = await dashboard_model_1.Payment.find({
            studentId,
            status: { $in: ["success", "paid"] },
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        const recentOrders = payments.map((payment) => ({
            _id: payment._id,
            courseTitle: courseMap.get(String(payment.courseId))?.title || "Course purchase",
            amount: Number(payment.amount || 0),
            status: payment.status === "success" ? "paid" : payment.status,
            createdAt: payment.createdAt,
        }));
        const certificates = completedCourses.slice(0, 5).map((course) => ({
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
    }
    catch (error) {
        console.error("Student dashboard load failed", error);
        return res.status(500).json({ message: "Failed to load student dashboard" });
    }
};
exports.getStudentDashboard = getStudentDashboard;
const getTeacherDashboardSummary = async (req, res) => {
    try {
        const teacherId = req.headers["x-user-id"];
        if (!teacherId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const courses = await course_model_1.Course.find({ teacherId }).sort({ updatedAt: -1 }).lean();
        const courseIds = courses.map((course) => String(course._id));
        const enrollments = courseIds.length
            ? await dashboard_model_1.Enrollment.find({ courseId: { $in: courseIds } }).lean()
            : [];
        const uniqueStudents = new Set(enrollments.map((enrollment) => String(enrollment.studentId)));
        const recentCourses = courses.slice(0, 5).map((course) => ({
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
        enrollments.forEach((enrollment) => {
            const createdAt = enrollment.createdAt ? new Date(enrollment.createdAt) : null;
            if (!createdAt)
                return;
            const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
            const bucket = chartMap.get(key);
            if (bucket) {
                bucket.count += 1;
            }
        });
        const avgRating = courses.length > 0
            ? Number((courses.reduce((sum, course) => sum + Number(course.ratingAvg || 0), 0) /
                courses.length).toFixed(1))
            : 0;
        return res.json({
            summary: {
                coursesCreated: courses.length,
                activeStudents: uniqueStudents.size,
                courseCompletions: enrollments.filter((item) => item.completed).length,
                avgRating,
                communitiesCreated: 0,
            },
            chartData: lastSixMonths,
            recentCourses,
        });
    }
    catch (error) {
        console.error("Teacher dashboard load failed", error);
        return res.status(500).json({ message: "Failed to load teacher dashboard" });
    }
};
exports.getTeacherDashboardSummary = getTeacherDashboardSummary;
const listCertificates = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    if (!studentId) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const certificates = await certificate_model_1.Certificate.find({ studentId }).sort({ issuedAt: -1 }).lean();
    return res.json({ certificates });
};
exports.listCertificates = listCertificates;
const generateCertificate = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const courseId = req.params.courseId;
    if (!studentId) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const course = (await course_model_1.Course.findById(courseId).lean());
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const enrollment = await dashboard_model_1.Enrollment.findOne({ studentId, courseId }).lean();
    if (!enrollment) {
        return res.status(403).json({ message: "You must enroll before generating a certificate" });
    }
    let certificate = (await certificate_model_1.Certificate.findOne({ studentId, courseId }));
    if (!certificate) {
        certificate = await certificate_model_1.Certificate.create({
            studentId,
            courseId,
            courseTitle: course.title,
            certificateId: `CERT-${String(courseId).slice(-6).toUpperCase()}-${Date.now()
                .toString()
                .slice(-6)}`,
            filePath: `/student/certificates/${courseId}`,
        });
    }
    return res.json({ success: true, certificate });
};
exports.generateCertificate = generateCertificate;
const downloadCertificate = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const certificate = (await certificate_model_1.Certificate.findOne({
        _id: req.params.id,
        studentId,
    }).lean());
    if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
    }
    const buffer = buildCertificatePdf(certificate);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${certificate.courseTitle.replace(/\s+/g, "_")}_certificate.pdf"`);
    return res.send(buffer);
};
exports.downloadCertificate = downloadCertificate;
const getPublishedCourseById = async (req, res) => {
    const course = await course_model_1.Course.findOne({
        _id: req.params.id,
        status: "published",
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    return res.json({ success: true, course });
};
exports.getPublishedCourseById = getPublishedCourseById;
const getInvoiceHtmlForCourse = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const payment = (await dashboard_model_1.Payment.findOne({
        _id: req.params.id,
        studentId,
    }).lean());
    if (!payment) {
        return res.status(404).json({ message: "Order not found" });
    }
    const course = (await course_model_1.Course.findById(payment.courseId).lean());
    const invoice = {
        ...payment,
        invoiceNumber: `INV-${String(payment._id).slice(-6).toUpperCase()}`,
        course,
        paymentMethod: payment.amount > 0 ? "online" : "free",
    };
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(buildInvoiceHtml(invoice));
};
exports.getInvoiceHtmlForCourse = getInvoiceHtmlForCourse;
