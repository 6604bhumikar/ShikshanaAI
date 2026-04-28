import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FileText, 
  CalendarDays, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  ArrowLeft,
  Clock,
  Upload,
  Award
} from "lucide-react";
import { toast } from 'react-toastify';

export default function AssignmentsList() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");

  const token = localStorage.getItem("accessToken");
  const API_BASE = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";

  const getRequirements = (description = "") =>
    description
      .split(/(?:\r?\n|\r|^)-\s+/)
      .filter(
        (item) =>
          item.trim().length > 5 &&
          !item.toLowerCase().includes("submission instructions")
      )
      .map((item) => item.trim());

  /* =========================
     FORMAT DATE WITH RELATIVE TIME
  ========================= */
  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return "No due date";
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
      if (diffDays === 0) return "Due today";
      if (diffDays === 1) return "Due tomorrow";
      return `Due in ${diffDays} days`;
    };
  }, []);

  /* =========================
     LOAD ASSIGNMENTS
  ========================= */
  const loadAssignments = async () => {
    if (!courseId || !token) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load course details for header
      const courseRes = await axios.get(
        `${API_BASE}/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourseTitle(courseRes.data?.course?.title || courseRes.data?.title || "Course");

      // Load assignments
      const res = await axios.get(
        `${API_BASE}/courses/${courseId}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      // ✅ SUPPORT BOTH RESPONSE SHAPES
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.assignments || res.data?.data || [];
        
      setAssignments(list);
    } catch (err) {
      console.error("Load assignments failed", err);
      const errorMsg = err.response?.data?.message || "Failed to load assignments. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, { 
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [courseId, token]);

  /* =========================
     SKELETON LOADER
  ========================= */
  const AssignmentSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded w-1/4 ml-auto"></div>
    </div>
  );

  /* =========================
     RENDER
  ========================= */
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignments Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition-colors"
            aria-label="Back to course"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {courseTitle || "Course"}
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Course Assignments
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mt-3">
              Complete and submit your assignments as PDF files. 
              Track your progress and view instructor feedback after grading.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <AssignmentSkeleton key={i} />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Assignments Available</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              There are no assignments for this course yet. 
              Check back later or contact your instructor for updates.
            </p>
            <button
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-md"
            >
              Return to Course
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {assignments.map((a) => {
              const isSubmitted = a.submission?.status === "submitted" || a.submission?.status === "graded";
              const isGraded = a.submission?.status === "graded";
              const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && !isSubmitted;
              const requirements = getRequirements(a.description);
              const assignmentPath = isSubmitted
                ? `/student/assignments/${a._id}`
                : `/student/assignments/${a._id}/submit`;
              const buttonLabel = isGraded
                ? "View Feedback"
                : isSubmitted
                ? "View Submission"
                : "Submit Assignment";
              const buttonClass = isSubmitted
                ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg";

              return (
                <div
                  key={a._id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                    isOverdue && !isSubmitted 
                      ? "border-rose-200" 
                      : isGraded 
                      ? "border-emerald-100" 
                      : "border-gray-100"
                  }`}
                >
                  {/* Header with Status Badge */}
                  <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{a.title}</h2>
                          <div className="flex-shrink-0 ml-4">
                            {isGraded ? (
                              <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                Graded
                              </span>
                            ) : isSubmitted ? (
                              <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Submitted
                              </span>
                            ) : isOverdue ? (
                              <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Overdue
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(a.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {a.description && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {a.description.split("Submission instructions:")[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Requirements Section */}
                  {requirements.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-gray-800">Requirements</h3>
                      </div>
                      <ul className="space-y-2">
                        {requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadata Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {a.maxMarks && (
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          <span>Max Marks: {a.maxMarks}</span>
                        </div>
                      )}
                      {a.dueDate && (
                        <div className={`flex items-center gap-1.5 ${
                          isOverdue && !isSubmitted ? "text-rose-600 font-medium" : ""
                        }`}>
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>Due: {new Date(a.dueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => navigate(assignmentPath)}
                      className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${buttonClass}`}
                      aria-label={`${buttonLabel}: ${a.title}`}
                    >
                      {isGraded ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          View Feedback
                        </>
                      ) : isSubmitted ? (
                        <>
                          <FileText className="w-4 h-4" />
                          View Submission
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Submit Assignment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Footer Note */}
        <div className="mt-10 text-center text-sm text-gray-500 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p>
              <span className="font-medium text-indigo-600">Note:</span> Assignments must be submitted as PDF files. 
              After submission, your instructor will review and provide feedback. 
              You'll receive a notification when your grade is available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
