import { Router } from "express";
import {
  attachLessonMedia,
  addLesson,
  addUnit,
  createCourse,
  deleteCourse,
  deleteLesson,
  deleteUnit,
  downloadCertificate,
  generateCertificate,
  getCourseDetails,
  getCourseReviews,
  getCourses,
  getLessons,
  getPublishedCourseById,
  getStudentCoursePlayer,
  getStudentDashboard,
  getTeacherDashboardSummary,
  getUnits,
  listCertificates,
  submitForReview,
  updateCourse,
  updateCourseStatus,
} from "../controllers/course.controller";
import {
  askQuestion,
  addWishlistItem,
  createAnnouncement,
  createCommunity,
  createCommunityPost,
  createNote,
  deleteCommunityPost,
  deleteNote,
  getMyCourses,
  handleCommunityRequest,
  joinCommunity,
  listAnnouncements,
  listCommunities,
  listCommunityPosts,
  listCommunityRequests,
  listCourseQuestions,
  listNotes,
  listTeacherQuestions,
  listWishlist,
  removeWishlistItem,
  replyToQuestion,
  updateCommunityPost,
  updateNote,
  upsertCourseReview,
} from "../controllers/engagement.controller";
import {
  createAssignment,
  createCoupon,
  deleteCoupon,
  getCourseAnalytics,
  getAssignmentDetails,
  getAssignmentSubmissionForViewer,
  getMyAssignmentSubmission,
  getQuiz,
  gradeSubmission,
  listAssignmentSubmissions,
  listAssignments,
  listCourseStudents,
  listCoupons,
  markLessonComplete,
  saveQuiz,
  submitAssignment,
  submitQuiz,
  validateCoupon,
} from "../controllers/learning.controller";
import { requireTeacher } from "../middleware/role.middleware";

const router = Router();

router.get("/dashboard", getStudentDashboard);
router.get("/dashboard/summary", requireTeacher, getTeacherDashboardSummary);
router.get("/my-courses", getMyCourses);

router.get("/certificates", listCertificates);
router.post("/certificates/generate/:courseId", generateCertificate);
router.get("/certificates/:id/download", downloadCertificate);

router.get("/courses", getCourses);
router.post("/coupons/validate", validateCoupon);
router.get("/assignments/:assignmentId", getAssignmentDetails);
router.get("/assignments/:assignmentId/submission", getAssignmentSubmissionForViewer);
router.post("/assignments/:assignmentId/submit", submitAssignment);
router.get("/courses/:courseId/assignments", listAssignments);
router.post("/courses/:courseId/assignments", requireTeacher, createAssignment);
router.get("/courses/:courseId/students", requireTeacher, listCourseStudents);
router.get("/courses/:courseId/analytics", requireTeacher, getCourseAnalytics);
router.get("/assignments/:assignmentId/submissions", requireTeacher, listAssignmentSubmissions);
router.put("/submissions/:submissionId/grade", requireTeacher, gradeSubmission);
router.get("/courses/:courseId/coupons", requireTeacher, listCoupons);
router.post("/courses/:courseId/coupons", requireTeacher, createCoupon);
router.delete("/courses/:courseId/coupons/:couponId", requireTeacher, deleteCoupon);
router.get("/courses/:courseId/units/:unitId/quiz", getQuiz);
router.post("/courses/:courseId/units/:unitId/quiz", requireTeacher, saveQuiz);
router.post("/courses/:courseId/units/:unitId/quiz/submit", submitQuiz);
router.get("/courses/:courseId/final-quiz", getQuiz);
router.post("/courses/:courseId/final-quiz", submitQuiz);
router.put("/courses/:courseId/final-quiz", requireTeacher, saveQuiz);
router.get("/courses/:courseId/announcements", listAnnouncements);
router.post("/courses/:courseId/announcements", requireTeacher, createAnnouncement);
router.get("/courses/:courseId/notes", listNotes);
router.post("/courses/:courseId/notes", createNote);
router.put("/courses/:courseId/notes/:noteId", updateNote);
router.delete("/courses/:courseId/notes/:noteId", deleteNote);
router.get("/courses/:courseId/qna", listCourseQuestions);
router.post("/courses/:courseId/qna", askQuestion);
router.post("/courses/:courseId/review", upsertCourseReview);
router.post("/courses", requireTeacher, createCourse);
router.post("/courses/:courseId/lessons/:lessonId/complete", markLessonComplete);
router.get("/courses/:courseId/units/:unitId/lessons", requireTeacher, getLessons);
router.post("/courses/:courseId/units/:unitId/lessons", requireTeacher, addLesson);
router.delete("/courses/:courseId/units/:unitId/lessons/:lessonIndex", requireTeacher, deleteLesson);
router.get("/courses/:courseId/units", requireTeacher, getUnits);
router.post("/courses/:courseId/units", requireTeacher, addUnit);
router.delete("/courses/:courseId/units/:unitId", requireTeacher, deleteUnit);
router.get("/courses/:courseId/player", getStudentCoursePlayer);
router.get("/courses/:idOrSlug/reviews", getCourseReviews);
router.get("/courses/:idOrSlug", getCourseDetails);
router.put("/courses/:id", requireTeacher, updateCourse);
router.delete("/courses/:id", requireTeacher, deleteCourse);
router.post("/courses/:id/submit", requireTeacher, submitForReview);

router.patch("/internal/courses/:id/status", updateCourseStatus);
router.get("/internal/courses/:id", getPublishedCourseById);
router.patch("/internal/courses/:courseId/lessons/:lessonId/media", attachLessonMedia);

router.get("/qna", requireTeacher, listTeacherQuestions);
router.post("/qna/:qnaId/reply", requireTeacher, replyToQuestion);

router.get("/wishlist", listWishlist);
router.post("/wishlist", addWishlistItem);
router.delete("/wishlist/:courseId", removeWishlistItem);

router.get("/communities", listCommunities);
router.post("/communities", requireTeacher, createCommunity);
router.post("/communities/:communityId/join", joinCommunity);
router.get("/communities/:communityId/join-requests", requireTeacher, listCommunityRequests);
router.post("/communities/:communityId/join/:studentId/:action", requireTeacher, handleCommunityRequest);
router.get("/communities/:communityId/posts", listCommunityPosts);
router.post("/communities/:communityId/posts", requireTeacher, createCommunityPost);
router.put("/communities/:communityId/posts/:postId", requireTeacher, updateCommunityPost);
router.delete("/communities/:communityId/posts/:postId", requireTeacher, deleteCommunityPost);

export default router;
