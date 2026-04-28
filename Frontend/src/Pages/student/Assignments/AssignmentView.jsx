import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader,
  MessageSquare,
  Target,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AssignmentView() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const API_BASE = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assignmentId || !token) {
      setLoading(false);
      setError("Session expired. Please login again.");
      return;
    }

    const loadSubmission = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE}/assignments/${assignmentId}/submission`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSubmission(res.data?.submission || res.data || null);
      } catch (err) {
        console.error("Failed to load submission", err);
        const errorMsg =
          err.response?.data?.message || "Failed to load your submission. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg, {
          autoClose: 4000,
          position: "top-center",
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [assignmentId, token, API_BASE]);

  const downloadPDF = () => {
    if (!submission?.pdfUrl) return;

    const link = document.createElement("a");
    link.href = submission.pdfUrl;
    link.download = submission.pdfName || `${submission.assignment?.title || "assignment"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl w-full animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-72 bg-gray-200 rounded-2xl"></div>
            <div className="lg:col-span-2 h-[28rem] bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Submission Found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            This assignment has not been submitted yet, or it could not be located.
          </p>
          <button
            onClick={() => navigate(`/student/assignments/${assignmentId}/submit`)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            Submit Assignment
          </button>
        </div>
      </div>
    );
  }

  const isGraded = submission.status === "graded";
  const assignmentTitle = submission.assignment?.title || "Assignment";
  const submittedAt = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";
  const gradedAt = submission.gradedAt
    ? new Date(submission.gradedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Pending review";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors"
            aria-label="Back to assignments"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {assignmentTitle}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mt-2">
              Review your submitted PDF and check your instructor feedback here once grading is done.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Submission Status</h2>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span
                    className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-1 ${
                      isGraded
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {isGraded ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Graded
                      </>
                    ) : (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        Under Review
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-gray-600">Submitted</span>
                  <span className="font-medium text-gray-800 text-right">{submittedAt}</span>
                </div>
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-gray-600">Graded</span>
                  <span className="font-medium text-gray-800 text-right">{gradedAt}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Marks</span>
                  <span className="font-bold text-indigo-600">
                    {submission.assignment?.maxMarks ?? "N/A"}
                  </span>
                </div>
                {isGraded && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-emerald-700 mb-1">Marks Awarded</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      {submission.score ?? 0}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <Target className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">Instructor Feedback</h2>
              </div>
              <div className="p-5">
                {submission.remarks ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm text-emerald-700 flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      Feedback received
                    </p>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {submission.remarks}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
                    <p className="font-medium mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Feedback pending
                    </p>
                    <p className="text-sm">
                      Your instructor has not added remarks yet. Check back after grading.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Submitted PDF</h2>
                </div>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-white">
                  <iframe
                    src={submission.pdfUrl}
                    title={`Submitted assignment for ${assignmentTitle}`}
                    className="w-full h-[650px] md:h-[700px] lg:h-[800px]"
                    loading="lazy"
                  />
                </div>
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Use the PDF viewer controls to review the file you submitted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
