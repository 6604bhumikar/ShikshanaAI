import { Request, Response } from "express";
import { Course } from "../models/course.model";
import { Enrollment } from "../models/dashboard.model";
import { ExternalUser } from "../models/external-user.model";
import { Assignment, AssignmentSubmission } from "../models/assignment.model";
import { Coupon } from "../models/coupon.model";
import { Quiz, QuizAttempt } from "../models/quiz.model";

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getQuizIdentity = (req: Request) => {
  const courseId = req.params.courseId;
  const unitId = req.params.unitId || null;
  const kind = unitId ? "unit" : "final";
  return { courseId, unitId, kind };
};

const calculateQuizCountMap = async (courseId: string) => {
  const quizzes = await Quiz.find({ courseId, kind: "unit" }).lean();
  return new Map(
    quizzes.map((quiz: any) => [String(quiz.unitId), Number(quiz.questions?.length || 0)])
  );
};

const decorateUnitsForStudent = async (course: any, studentId?: string) => {
  const enrollment =
    studentId &&
    (await Enrollment.findOne({
      studentId,
      courseId: String(course._id),
    }).lean());

  const completedLessonIds = new Set(
    Array.isArray((enrollment as any)?.completedLessons)
      ? (enrollment as any).completedLessons.map((id: any) => String(id))
      : []
  );
  const quizCountMap = await calculateQuizCountMap(String(course._id));

  let previousUnlocked = true;
  const units = (course.units || []).map((unit: any) => {
    const unitSource = typeof unit?.toObject === "function" ? unit.toObject() : unit;
    const lessons = (unit.lessons || []).map((lesson: any) => ({
      ...(typeof lesson?.toObject === "function" ? lesson.toObject() : lesson),
      isCompleted: completedLessonIds.has(String(lesson._id)),
    }));
    const completedLessons = lessons.filter((lesson: any) => lesson.isCompleted).length;
    const isCompleted = lessons.length > 0 && completedLessons === lessons.length;
    const unitData = {
      ...unitSource,
      lessons,
      quizCount: quizCountMap.get(String(unit._id)) || 0,
      isCompleted,
      isLocked: Boolean(course.isSequential) ? !previousUnlocked : false,
    };

    previousUnlocked = !Boolean(course.isSequential) || isCompleted;
    return unitData;
  });

  return {
    units,
    finalQuizUnlocked:
      units.length === 0 || units.every((unit: any) => unit.isCompleted || !unit.lessons.length),
    enrollment,
  };
};

const getTeacherOwnedCourse = async (courseId: string, teacherId: string) =>
  Course.findOne({ _id: courseId, teacherId });

const scoreAnswer = (question: any, answer: any) => {
  const marks = Number(question.marks || question.points || 1);
  const type = String(question.type || "mcq");

  if (["long_answer", "coding"].includes(type)) {
    return 0;
  }

  if (type === "mcq") {
    const normalizedOptions = Array.isArray(question.options)
      ? question.options.map((option: any) =>
          typeof option === "string" ? option : option?.text || ""
        )
      : [];
    const correct = normalizeText(question.correctAnswer);
    const submitted = normalizeText(answer);
    return normalizedOptions.some((option: string) => normalizeText(option) === submitted) &&
      correct === submitted
      ? marks
      : 0;
  }

  if (type === "multi") {
    const expected = Array.isArray(question.correctAnswer)
      ? question.correctAnswer.map(normalizeText).sort().join("|")
      : normalizeText(question.correctAnswer);
    const submitted = Array.isArray(answer)
      ? answer.map(normalizeText).sort().join("|")
      : normalizeText(answer);
    return expected && expected === submitted ? marks : 0;
  }

  return normalizeText(question.correctAnswer) === normalizeText(answer) ? marks : 0;
};

const buildQuizResponse = (quiz: any) => ({
  ...quiz,
  totalMarks: (quiz.questions || []).reduce(
    (sum: number, question: any) => sum + Number(question.marks || question.points || 1),
    0
  ),
});

export const listAssignments = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string | undefined;
  const role = req.headers["x-user-role"] as string | undefined;
  const { courseId } = req.params;

  const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 }).lean();
  if (role === "teacher") {
    return res.json(assignments);
  }

  const studentId = req.headers["x-user-id"] as string;
  const submissions = await AssignmentSubmission.find({
    courseId,
    studentId,
  }).lean();
  const submissionMap = new Map(
    submissions.map((submission: any) => [String(submission.assignmentId), submission])
  );

  return res.json({
    assignments: assignments.map((assignment: any) => ({
      ...assignment,
      submission: submissionMap.get(String(assignment._id)) || null,
    })),
  });
};

export const createAssignment = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { courseId } = req.params;

  const course = await getTeacherOwnedCourse(courseId, teacherId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const assignment = await Assignment.create({
    courseId,
    teacherId,
    title: String(req.body.title || "").trim(),
    description: String(req.body.description || "").trim(),
    instructions: String(req.body.instructions || req.body.description || "").trim(),
    maxMarks: Number(req.body.maxMarks || 100),
    dueDate: req.body.dueDate || null,
    type: req.body.type || "file",
  });

  return res.status(201).json({ assignment });
};

export const getAssignmentDetails = async (req: Request, res: Response) => {
  const assignment = (await Assignment.findById(req.params.assignmentId).lean()) as any;
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const studentId = req.headers["x-user-id"] as string | undefined;
  const submission =
    studentId &&
    (await AssignmentSubmission.findOne({
      assignmentId: String(assignment._id),
      studentId,
    }).lean());

  return res.json({
    assignment: {
      ...assignment,
      submission: submission || null,
    },
  });
};

export const submitAssignment = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const assignment = (await Assignment.findById(req.params.assignmentId).lean()) as any;
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const fileData = String(req.body.fileData || "");
  if (!fileData.startsWith("data:application/pdf")) {
    return res.status(400).json({ message: "PDF file data is required" });
  }

  const submission = await AssignmentSubmission.findOneAndUpdate(
    {
      assignmentId: String(assignment._id),
      studentId,
    },
    {
      assignmentId: String(assignment._id),
      courseId: assignment.courseId,
      studentId,
      pdfName: String(req.body.fileName || "assignment.pdf"),
      pdfUrl: fileData,
      status: "submitted",
      score: null,
      remarks: "",
      submittedAt: new Date(),
      gradedAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({ success: true, submission });
};

export const getMyAssignmentSubmission = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const assignment = (await Assignment.findById(req.params.assignmentId).lean()) as any;
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const submission = await AssignmentSubmission.findOne({
    assignmentId: String(assignment._id),
    studentId,
  }).lean();

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  return res.json({
    submission: {
      ...submission,
      assignment,
    },
  });
};

export const listAssignmentSubmissions = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const assignment = (await Assignment.findById(req.params.assignmentId).lean()) as any;
  if (!assignment || assignment.teacherId !== teacherId) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  const submissions = await AssignmentSubmission.find({
    assignmentId: String(assignment._id),
  })
    .sort({ submittedAt: -1 })
    .lean();

  const studentIds = submissions.map((submission: any) => submission.studentId);
  const students = studentIds.length
    ? await ExternalUser.find({ _id: { $in: studentIds } }).lean()
    : [];
  const studentMap = new Map(students.map((student: any) => [String(student._id), student]));

  return res.json({
    submissions: submissions.map((submission: any) => ({
      ...submission,
      assignment,
      student: studentMap.get(String(submission.studentId)) || null,
    })),
  });
};

export const getAssignmentSubmissionForViewer = async (req: Request, res: Response) => {
  const role = req.headers["x-user-role"] as string | undefined;
  const userId = req.headers["x-user-id"] as string;
  const assignment = (await Assignment.findById(req.params.assignmentId).lean()) as any;

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  let submission;
  if (role === "teacher") {
    if (assignment.teacherId !== userId) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    submission = await AssignmentSubmission.findOne({
      assignmentId: String(assignment._id),
    })
      .sort({ submittedAt: -1 })
      .lean();
  } else {
    submission = await AssignmentSubmission.findOne({
      assignmentId: String(assignment._id),
      studentId: userId,
    }).lean();
  }

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  const student =
    (await ExternalUser.findById(String((submission as any).studentId)).lean()) || null;

  return res.json({
    submission: {
      ...submission,
      assignment,
      student,
    },
  });
};

export const gradeSubmission = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const submission = await AssignmentSubmission.findById(req.params.submissionId);
  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  const assignment = (await Assignment.findById(submission.assignmentId).lean()) as any;
  if (!assignment || assignment.teacherId !== teacherId) {
    return res.status(404).json({ message: "Submission not found" });
  }

  submission.status = "graded";
  submission.score = Number(req.body.score || 0);
  submission.remarks = String(req.body.remarks || "").trim();
  submission.gradedAt = new Date();
  await submission.save();

  return res.json({ success: true, submission });
};

export const getQuiz = async (req: Request, res: Response) => {
  const role = req.headers["x-user-role"] as string | undefined;
  const teacherId = req.headers["x-user-id"] as string | undefined;
  const studentId = req.headers["x-user-id"] as string | undefined;
  const { courseId, unitId, kind } = getQuizIdentity(req);

  const quiz = (await Quiz.findOne({ courseId, unitId, kind }).lean()) as any;
  if (!quiz) {
    return res.json({ quiz: null });
  }

  if (role === "teacher") {
    if (quiz.teacherId !== teacherId) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    return res.json({ quiz: buildQuizResponse(quiz) });
  }

  const attempts = studentId
    ? await QuizAttempt.find({ courseId, unitId, kind, studentId })
        .sort({ createdAt: 1 })
        .lean()
    : [];
  const latestAttempt = attempts[attempts.length - 1];

  return res.json({
    quiz: buildQuizResponse(quiz),
    attemptNo: attempts.length + 1,
    quizCompleted: Boolean(latestAttempt?.passed),
    passed: Boolean(latestAttempt?.passed),
    percentage: Number(latestAttempt?.percentage || 0),
  });
};

export const saveQuiz = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { courseId, unitId, kind } = getQuizIdentity(req);
  const course = await getTeacherOwnedCourse(courseId, teacherId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const questions = Array.isArray(req.body.questions)
    ? req.body.questions.map((question: any) => ({
        question: String(question.question || "").trim(),
        type: question.type || "mcq",
        options: Array.isArray(question.options) ? question.options : [],
        correctAnswer:
          question.correctAnswer !== undefined ? question.correctAnswer : null,
        marks: Number(question.marks || question.points || 1),
      }))
    : [];

  const quiz = await Quiz.findOneAndUpdate(
    { courseId, unitId, kind },
    {
      courseId,
      unitId,
      kind,
      teacherId,
      title: kind === "final" ? course.title : "",
      questions,
      duration: req.body.duration ?? null,
      passPercentage: Number(req.body.passPercentage || 40),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json({ success: true, quiz: buildQuizResponse(quiz.toObject()) });
};

export const submitQuiz = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const { courseId, unitId, kind } = getQuizIdentity(req);
  const quiz = (await Quiz.findOne({ courseId, unitId, kind }).lean()) as any;

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const obtainedMarks = (quiz.questions || []).reduce((sum: number, question: any, index: number) => {
    const submitted = answers[index]?.answer ?? answers[index]?.value ?? "";
    return sum + scoreAnswer(question, submitted);
  }, 0);
  const totalMarks = (quiz.questions || []).reduce(
    (sum: number, question: any) => sum + Number(question.marks || question.points || 1),
    0
  );
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const passed = percentage >= Number(quiz.passPercentage || 40);
  const previousAttempts = await QuizAttempt.countDocuments({ courseId, unitId, kind, studentId });

  const attempt = await QuizAttempt.create({
    courseId,
    unitId,
    kind,
    studentId,
    answers,
    obtainedMarks,
    totalMarks,
    percentage,
    passed,
    attemptNo: previousAttempts + 1,
    completedAt: new Date(),
  });

  return res.json({
    success: true,
    attemptNo: attempt.attemptNo,
    obtainedMarks,
    totalMarks,
    percentage,
    passed,
  });
};

export const listCoupons = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await getTeacherOwnedCourse(req.params.courseId, teacherId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const coupons = await Coupon.find({ courseId: req.params.courseId, isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  return res.json(coupons);
};

export const createCoupon = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await getTeacherOwnedCourse(req.params.courseId, teacherId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const code = String(req.body.code || "").trim().toUpperCase();
  const discountPercent = Number(req.body.discount || req.body.discountPercent || 0);
  const expiresAt = new Date(req.body.expiry || req.body.expiresAt);

  if (!code) {
    return res.status(400).json({ message: "Coupon code is required" });
  }

  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    return res.status(400).json({ message: "Discount must be between 1 and 100 percent" });
  }

  if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
    return res.status(400).json({ message: "Expiry date must be a future date" });
  }

  try {
    const coupon = await Coupon.create({
      courseId: req.params.courseId,
      teacherId,
      code,
      discountPercent,
      expiresAt,
      isActive: true,
    });

    return res.status(201).json(coupon);
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Coupon code already exists for this course" });
    }
    throw error;
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const coupon = await Coupon.findById(req.params.couponId);
  if (!coupon || coupon.teacherId !== teacherId) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  coupon.isActive = false;
  await coupon.save();
  return res.json({ success: true });
};

export const validateCoupon = async (req: Request, res: Response) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  const courseId = String(req.body.courseId || "").trim();

  const coupon = (await Coupon.findOne({
    code,
    courseId,
    isActive: true,
    expiresAt: { $gte: new Date() },
  }).lean()) as any;

  if (!coupon) {
    return res.status(404).json({ message: "Invalid or expired coupon" });
  }

  return res.json({
    valid: true,
    discountPercent: Math.min(Math.max(Number(coupon.discountPercent || 0), 0), 100),
    code: coupon.code,
  });
};

export const markLessonComplete = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const { courseId, lessonId } = req.params;
  const course = await Course.findById(courseId).lean();

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const totalLessons = (course.units || []).reduce(
    (sum: number, unit: any) => sum + (unit.lessons || []).length,
    0
  );

  const enrollment = await Enrollment.findOneAndUpdate(
    { studentId, courseId },
    {
      $addToSet: { completedLessons: lessonId },
      $setOnInsert: { studentId, courseId, progress: 0, completed: false },
    },
    { new: true, upsert: true }
  );

  const completedLessons = Array.isArray((enrollment as any).completedLessons)
    ? (enrollment as any).completedLessons.length
    : 0;
  enrollment.set("progress", totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
  enrollment.set("completed", totalLessons > 0 && completedLessons >= totalLessons);
  await enrollment.save();

  return res.json({
    success: true,
    progress: enrollment.get("progress"),
    completed: enrollment.get("completed"),
  });
};

export const listCourseStudents = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { courseId } = req.params;
  const course = await getTeacherOwnedCourse(courseId, teacherId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const enrollments = await Enrollment.find({ courseId }).sort({ updatedAt: -1 }).lean();
  const studentIds = enrollments.map((enrollment: any) => enrollment.studentId);
  const students = studentIds.length
    ? ((await ExternalUser.find({ _id: { $in: studentIds } }).lean()) as any[])
    : [];
  const studentMap = new Map(students.map((student: any) => [String(student._id), student]));
  const finalAttempts = await QuizAttempt.find({ courseId, kind: "final", studentId: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .lean();
  const finalAttemptMap = new Map<string, any>();
  finalAttempts.forEach((attempt: any) => {
    const key = String(attempt.studentId);
    if (!finalAttemptMap.has(key)) {
      finalAttemptMap.set(key, attempt);
    }
  });

  const totalUnits = (course.units || []).length;

  return res.json({
    students: enrollments.map((enrollment: any) => {
      const student = studentMap.get(String(enrollment.studentId));
      const finalQuiz = finalAttemptMap.get(String(enrollment.studentId));
      const completedLessonIds = Array.isArray((enrollment as any).completedLessons)
        ? (enrollment as any).completedLessons.length
        : 0;
      const completedUnits = (course.units || []).filter((unit: any) =>
        (unit.lessons || []).every((lesson: any) =>
          Array.isArray((enrollment as any).completedLessons)
            ? (enrollment as any).completedLessons.includes(String(lesson._id))
            : false
        )
      ).length;

      return {
        _id: enrollment._id,
        name: student?.name || "Student",
        email: student?.email || "",
        progress: Number(enrollment.progress || 0),
        progressDetails: {
          completedLessons: completedLessonIds,
          completedUnits,
          totalUnits,
        },
        finalQuiz: finalQuiz
          ? {
              attempted: true,
              percentage: Number(finalQuiz.percentage || 0),
              passed: Boolean(finalQuiz.passed),
            }
          : { attempted: false },
      };
    }),
  });
};

export const getCourseAnalytics = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { courseId } = req.params;
  const course = await getTeacherOwnedCourse(courseId, teacherId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const courseData = course.toObject();
  const enrollments = await Enrollment.find({ courseId }).lean();
  const studentIds = enrollments.map((enrollment: any) => enrollment.studentId);
  const students = studentIds.length
    ? ((await ExternalUser.find({ _id: { $in: studentIds } }).lean()) as any[])
    : [];
  const studentMap = new Map(students.map((student: any) => [String(student._id), student]));

  const assignments = await Assignment.find({ courseId }).lean();
  const assignmentIds = assignments.map((assignment: any) => String(assignment._id));
  const submissions = assignmentIds.length
    ? await AssignmentSubmission.find({ assignmentId: { $in: assignmentIds } }).lean()
    : [];

  const unitAttempts = await QuizAttempt.find({ courseId, kind: "unit" }).lean();
  const finalAttempts = await QuizAttempt.find({ courseId, kind: "final" }).lean();

  const totalUnits = (courseData.units || []).length;
  const totalAssignments = assignments.length;

  const studentsPayload = enrollments.map((enrollment: any) => {
    const studentId = String(enrollment.studentId);
    const student = studentMap.get(studentId);
    const studentSubmissions = submissions.filter(
      (submission: any) => String(submission.studentId) === studentId
    );
    const gradedSubmissions = studentSubmissions.filter(
      (submission: any) => submission.status === "graded"
    );
    const studentFinalAttempt = finalAttempts
      .filter((attempt: any) => String(attempt.studentId) === studentId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const units = (courseData.units || []).map((unit: any) => {
      const lessons = unit.lessons || [];
      const completed = lessons.length > 0 && lessons.every((lesson: any) =>
        Array.isArray((enrollment as any).completedLessons)
          ? (enrollment as any).completedLessons.includes(String(lesson._id))
          : false
      );
      const unitAttempt = unitAttempts
        .filter(
          (attempt: any) =>
            String(attempt.studentId) === studentId && String(attempt.unitId) === String(unit._id)
        )
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      return {
        unitTitle: unit.title,
        completed,
        quiz: unitAttempt
          ? {
              attempted: true,
              completed: Boolean(unitAttempt.passed),
              percentage: Number(unitAttempt.percentage || 0),
              hasPartialAttempt: !unitAttempt.passed,
              questionsAttempted: Array.isArray(unitAttempt.answers)
                ? unitAttempt.answers.length
                : 0,
            }
          : {
              attempted: false,
              completed: false,
              percentage: 0,
              hasPartialAttempt: false,
              questionsAttempted: 0,
            },
      };
    });

    const avgAssignmentScore = gradedSubmissions.length
      ? Math.round(
          gradedSubmissions.reduce(
            (sum: number, submission: any) => sum + Number(submission.score || 0),
            0
          ) / gradedSubmissions.length
        )
      : 0;

    return {
      name: student?.name || "Student",
      email: student?.email || "",
      progress: Number(enrollment.progress || 0),
      status: studentFinalAttempt
        ? studentFinalAttempt.passed
          ? "Passed"
          : "Failed"
        : "In Progress",
      assignments: {
        total: totalAssignments,
        submitted: studentSubmissions.length,
        avgScore: avgAssignmentScore,
      },
      finalQuiz: studentFinalAttempt
        ? {
            attempted: true,
            percentage: Number(studentFinalAttempt.percentage || 0),
            passed: Boolean(studentFinalAttempt.passed),
          }
        : {
            attempted: false,
          },
      units,
    };
  });

  const stats = {
    enrollments: enrollments.length,
    completed: enrollments.filter((enrollment: any) => Boolean(enrollment.completed)).length,
    avgProgress: enrollments.length
      ? Math.round(
          enrollments.reduce((sum: number, enrollment: any) => sum + Number(enrollment.progress || 0), 0) /
            enrollments.length
        )
      : 0,
    avgAssignmentScore:
      studentsPayload.length > 0
        ? Math.round(
            studentsPayload.reduce(
              (sum: number, student: any) => sum + Number(student.assignments.avgScore || 0),
              0
            ) / studentsPayload.length
          )
        : 0,
    studentsNeedingAttention: studentsPayload.filter((student: any) =>
      student.units.some((unit: any) => unit.quiz?.hasPartialAttempt && !unit.quiz?.completed)
    ).length,
    totalAssignments,
  };

  return res.json({
    course: {
      _id: courseData._id,
      title: courseData.title,
      totalUnits,
    },
    stats,
    students: studentsPayload,
  });
};

export { decorateUnitsForStudent, calculateQuizCountMap };
