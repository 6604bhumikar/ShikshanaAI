import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

/* ───────── PUBLIC ───────── */
import LandingPage from "./Pages/publicpages/LandingPage";
import Catalog from "./Pages/publicpages/Catalog";
import CourseDetail from "./Pages/publicpages/CourseDetail";
import Login from "./Pages/publicpages/Login";
import Register from "./Pages/publicpages/Register";
import ForgotPassword from "./Pages/publicpages/ForgotPassword";
import ResetPassword from "./Pages/publicpages/ResetPassword";
import NotFound from "./Pages/publicpages/NotFound";
import Checkout from "@/Pages/publicpages/Checkout";

/* ───────── STUDENT ───────── */
import StudentDashboard from "./Pages/student/Dashboard/StudentDashboard";
import MyLearning from "./Pages/student/Courses/MyLearning";
import WishlistPage from "./Pages/student/Courses/WishlistPage";
import CoursePlayer from "./Pages/student/Player/CoursePlayer";
import AttemptQuiz from "./Pages/student/Quiz/AttemptQuiz";
import QuizResult from "./Pages/student/Quiz/QuizResult";
import StudentFinalQuiz from "./Pages/student/Quiz/StudentFinalQuiz";
import FinalQuizResult from "./Pages/student/Quiz/FinalQuizResult";
import OrdersPage from "./Pages/student/Orders/OrdersPage";
import CertificatesPage from "./Pages/student/Certificates/CertificatesPage";
import AssignmentsList from "./Pages/student/Assignments/AssignmentsList";
import AssignmentSubmit from "./Pages/student/Assignments/AssignmentSubmit";
import AssignmentView from "./Pages/student/Assignments/AssignmentView";



/* ───────── COMMUNITY ───────── */
import Communities from "@/pages/student/Dashboard/Communities";
import CommunityPage from "./pages/Community/CommunityPage";

/* ───────── TEACHER ───────── */
import TeacherDashboard from "./Pages/Teacher/Dashboard/TeacherDashboard";
import MyCourses from "./Pages/Teacher/Courses/MyCourses";
import CreateCourse from "./Pages/Teacher/Courses/CreateCourse";
import EditCourse from "./Pages/Teacher/Courses/EditCourse";
import UnitsManager from "./Pages/Teacher/UnitsManager";
import LessonsManager from "./Pages/Teacher/LessonsManager";
import UnitQuizBuilder from "./Pages/Teacher/UnitQuizBuilder";
import CourseStudents from "./Pages/Teacher/Courses/CourseStudents";
import FinalQuizList from "./Pages/Teacher/FinalQuizList";
import FinalQuizPreview from "./Pages/Teacher/FinalQuizPreview";
import TeacherFinalQuizEditor from "./Pages/Teacher/TeacherFinalQuizEditor";
import FinalQuizBuilder from "./Pages/Teacher/FinalQuizBuilder";
import Analytics from "./Pages/Teacher/Analytics";
import Announcements from "./Pages/Teacher/Announcements";
import Qna from "./Pages/Teacher/QnAPage";
import Recorder from "./Pages/Teacher/RecorderPage";
import Coupons from "./Pages/Teacher/CouponsPage";
import AssignmentsManager from "./Pages/Teacher/Assignments/AssignmentsManager";
import AssignmentSubmissions from "./Pages/Teacher/Assignments/AssignmentSubmissions";
import TeacherCommunities from "./Pages/Teacher/Communities/TeacherCommunities";
import CreateCommunity from "./Pages/Teacher/Communities/CreateCommunity";
import CommunityRequests from "./Pages/Teacher/Communities/CommunityRequests";
import TeacherCommunityChat from "./Pages/Teacher/Communities/TeacherCommunityChat";

/* ───────── ADMIN ───────── */
import AdminDashboard from "./Pages/admin/AdminDashboard";
import CourseModeration from "./Pages/admin/CourseModeration";
import UserManagement from "./Pages/admin/UserManagement";
import Payouts from "./Pages/admin/Payouts";
import SettingsPage from "./Pages/admin/Settings";
import AdminCommunityApproval from "./Pages/Admin/Communities/AdminCommunityApproval";

/* ───────── ROLE GUARD ───────── */
function RoleRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== role) {
    if (user.role === "student") return <Navigate to="/dashboard" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

/* ───────── ROUTER CONFIG ───────── */
const router = createBrowserRouter([
  /* ===== PUBLIC ===== */
  { path: "/", element: <><Navbar /><LandingPage /></> },
  { path: "/catalog", element: <><Navbar /><Catalog /></> },
  { path: "/course/:id", element: <><Navbar /><CourseDetail /></> },
  { path: "/login", element: <><Navbar /><Login /></> },
  { path: "/register", element: <><Navbar /><Register /></> },
  { path: "/forgot", element: <><Navbar /><ForgotPassword /></> },
  { path: "/reset-password/:token", element: <><Navbar /><ResetPassword /></> },
  { path: "/checkout/:courseId", element: <><Navbar /><Checkout /></> },

  /* ===== STUDENT ===== */
  {
    path: "/dashboard",
    element: <RoleRoute role="student"><Navbar /><StudentDashboard /></RoleRoute>,
  },
  {
  path: "/courses/:courseId/player",
  element: (
    <RoleRoute role="student">
      <Navbar />
      <CoursePlayer />
    </RoleRoute>
  ),
},
  {
    path: "/my-learning",
    element: <RoleRoute role="student"><Navbar /><MyLearning /></RoleRoute>,
  },
  {
    path: "/student/wishlist",
    element: <RoleRoute role="student"><Navbar /><WishlistPage /></RoleRoute>,
  },

  /* 🎬 COURSE PLAYER (🔥 CRITICAL FIX) */
  {
    path: "/player/:courseId",
    element: <RoleRoute role="student"><Navbar /><CoursePlayer /></RoleRoute>,
  },
  {
  path: "/student/courses/:courseId",
  element: (
    <RoleRoute role="student">
      <Navbar />
      <CoursePlayer />
    </RoleRoute>
  ),
},
  {
    path: "/player/:courseId/:unitId/:lessonId",
    element: <RoleRoute role="student"><Navbar /><CoursePlayer /></RoleRoute>,
  },

  /* ===== QUIZ ===== */
  {
    path: "/student/courses/:courseId/units/:unitId/quiz",
    element: <RoleRoute role="student"><Navbar /><AttemptQuiz /></RoleRoute>,
  },
  {
    path: "/student/courses/:courseId/units/:unitId/quiz/result",
    element: <RoleRoute role="student"><Navbar /><QuizResult /></RoleRoute>,
  },
  {
  path: "/player/:courseId/units/:unitId/quiz/result",
  element: (
    <RoleRoute role="student">
      <Navbar />
      <QuizResult />
    </RoleRoute>
  ),
},

  /* ===== FINAL QUIZ ===== */
  {
    path: "/student/courses/:courseId/final-quiz",
    element: <RoleRoute role="student"><Navbar /><StudentFinalQuiz /></RoleRoute>,
  },
  {
    path: "/student/courses/:courseId/final-quiz/result",
    element: <RoleRoute role="student"><Navbar /><FinalQuizResult /></RoleRoute>,
  },

  /* ===== STUDENT EXTRAS ===== */
  
  {
    path: "/student/certificates",
    element: <RoleRoute role="student"><Navbar /><CertificatesPage /></RoleRoute>,
  },
  {
  path: "/student/orders",
  element: (
    <RoleRoute role="student">
      <Navbar />
      <OrdersPage />
    </RoleRoute>
  ),
},

  /* ===== ASSIGNMENTS ===== */
  {
    path: "/student/courses/:courseId/assignments",
    element: <RoleRoute role="student"><Navbar /><AssignmentsList /></RoleRoute>,
  },
  {
    path: "/student/assignments/:assignmentId/submit",
    element: <RoleRoute role="student"><Navbar /><AssignmentSubmit /></RoleRoute>,
  },
  {
    path: "/student/assignments/:assignmentId",
    element: <RoleRoute role="student"><Navbar /><AssignmentView /></RoleRoute>,
  },

  /* ===== COMMUNITIES ===== */
  {
    path: "/communities",
    element: <RoleRoute role="student"><Navbar /><Communities /></RoleRoute>,
  },
  {
    path: "/communities/:communityId",
    element: <RoleRoute role="student"><Navbar /><CommunityPage isTeacher={false} /></RoleRoute>,
  },

  /* ===== TEACHER ===== */
  {
    path: "/teacher/my-courses",
    element: <RoleRoute role="teacher"><Navbar /><MyCourses /></RoleRoute>,
  },
  {
    path: "/teacher/create-course",
    element: <RoleRoute role="teacher"><Navbar /><CreateCourse /></RoleRoute>,
  },
  {
    path: "/teacher/courses/:courseId",
    element: <RoleRoute role="teacher"><Navbar /><EditCourse /></RoleRoute>,
  },
  {
    path: "/teacher/courses/:courseId/units",
    element: <RoleRoute role="teacher"><Navbar /><UnitsManager /></RoleRoute>,
  },
  {
    path: "/teacher/courses/:courseId/units/:unitId/lessons",
    element: <RoleRoute role="teacher"><Navbar /><LessonsManager /></RoleRoute>,
  },
  {
    path: "/teacher/courses/:courseId/units/:unitId/quiz",
    element: <RoleRoute role="teacher"><Navbar /><UnitQuizBuilder /></RoleRoute>,
  },
  /* ───────── TEACHER ROUTES ───────── */
{
  path: "/teacher/dashboard",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <TeacherDashboard />
    </RoleRoute>
  ),
},
{
  path: "/teacher/courses/:courseId/students",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <CourseStudents />
    </RoleRoute>
  ),
},

/* ===== FINAL QUIZ (TEACHER) ===== */
{
  path: "/teacher/courses/:courseId/final-quiz",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <FinalQuizList />
    </RoleRoute>
  ),
},
{
  path: "/teacher/courses/:courseId/final-quiz/preview",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <FinalQuizPreview />
    </RoleRoute>
  ),
},
{
  path: "/teacher/courses/:courseId/final-quiz/edit",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <TeacherFinalQuizEditor />
    </RoleRoute>
  ),
},
{
  path: "/teacher/courses/:courseId/final-quiz/builder",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <FinalQuizBuilder />
    </RoleRoute>
  ),
},

/* ===== ANALYTICS ===== */
{
  path: "/teacher/courses/:courseId/analytics",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <Analytics />
    </RoleRoute>
  ),
},

/* ===== ANNOUNCEMENTS ===== */
{
  path: "/teacher/announcements",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <Announcements />
    </RoleRoute>
  ),
},

/* ===== QnA ===== */
{
  path: "/teacher/qna",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <Qna />
    </RoleRoute>
  ),
},

/* ===== RECORDER ===== */
{
  path: "/teacher/recorder",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <Recorder />
    </RoleRoute>
  ),
},

/* ===== COUPONS ===== */
{
  path: "/teacher/coupons",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <Coupons />
    </RoleRoute>
  ),
},

/* ===== ASSIGNMENTS ===== */
{
  path: "/teacher/courses/:courseId/assignments",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <AssignmentsManager />
    </RoleRoute>
  ),
},
{
  path: "/teacher/assignments/:assignmentId/submissions",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <AssignmentSubmissions />
    </RoleRoute>
  ),
},

/* ===== TEACHER COMMUNITIES ===== */

{
  path: "/teacher/communities",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <TeacherCommunities />
    </RoleRoute>
  ),
},
{
  path: "/teacher/communities/create",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <CreateCommunity />
    </RoleRoute>
  ),
},

// 🔥 THIS FIXES YOUR 404
{
  path: "/teacher/communities/:communityId",
  element: <Navigate to="chat" replace />,
},

{
  path: "/teacher/communities/:communityId/chat",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <TeacherCommunityChat />
    </RoleRoute>
  ),
},
{
  path: "/teacher/communities/:communityId/requests",
  element: (
    <RoleRoute role="teacher">
      <Navbar />
      <CommunityRequests />
    </RoleRoute>
  ),
},


  /* ===== ADMIN ===== */
 /* ───────── ADMIN ROUTES ───────── */
{
  path: "/admin/dashboard",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <AdminDashboard />
    </RoleRoute>
  ),
},
{
  path: "/admin/courses",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <CourseModeration />
    </RoleRoute>
  ),
},
{
  path: "/admin/course-moderation",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <CourseModeration />
    </RoleRoute>
  ),
},
{
  path: "/admin/users",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <UserManagement />
    </RoleRoute>
  ),
},
{
  path: "/admin/user-management",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <UserManagement />
    </RoleRoute>
  ),
},

{
  path: "/admin/payouts",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <Payouts />
    </RoleRoute>
  ),
},
{
  path: "/admin/settings",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <SettingsPage />
    </RoleRoute>
  ),
},
{
  path: "/admin/communities",
  element: (
    <RoleRoute role="admin">
      <Navbar />
      <AdminCommunityApproval />
    </RoleRoute>
  ),
},
  /* ===== FALLBACK ===== */
  { path: "*", element: <NotFound /> },
]);

/* ───────── APP ───────── */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
