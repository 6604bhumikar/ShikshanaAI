import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  PencilIcon, 
  XMarkIcon,
  FolderOpenIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

export default function AssignmentSubmissions() {
  const { assignmentId } = useParams();

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [gradingId, setGradingId] = useState(null);
  const [score, setScore] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await axios.get(
        `${API}/assignments/${assignmentId}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmissions(Array.isArray(res.data.submissions) ? res.data.submissions : []);
      setError("");
    } catch (err) {
      console.error("Load submissions failed", err);
      setError("Failed to load submissions. Please try again later.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const validateGrade = () => {
    if (score === "") {
      setError("Please enter a score");
      return false;
    }
    if (isNaN(score) || Number(score) < 0) {
      setError("Please enter a valid score");
      return false;
    }
    setError("");
    return true;
  };

  const submitGrade = async (submissionId) => {
    if (!validateGrade()) return;

    setIsSubmitting(true);
    setError("");

    try {
      await axios.put(
        `${API}/submissions/${submissionId}/grade`,
        { score: Number(score), remarks },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGradingId(null);
      setScore("");
      setRemarks("");
      await loadSubmissions();
    } catch (err) {
      console.error("Grade submission failed", err);
      setError(err.response?.data?.message || "Failed to grade submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStudentName = (student) => {
    if (!student) return "Student";
    return (
      student.fullName ||
      student.name ||
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
      "Student"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FolderOpenIcon className="h-10 w-10 text-indigo-600" />
            <h1 className="ml-3 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Assignment Submissions
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review student submissions and provide grades with feedback. All submissions are in PDF format for easy review.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center">
            <span className="mr-2 text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Students haven't submitted their assignments yet. Check back later or remind students about the deadline.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const isGraded = submission.status === "graded";
              const studentName = getStudentName(submission.student);

              return (
                <div
                  key={submission._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Student Header */}
                  <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-semibold text-lg">
                              {studentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            {studentName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {submission.student?.email || "—"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <span>Submitted:</span>
                        <span className="ml-2 font-medium text-gray-700">
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PDF Viewer */}
                  <div className="px-6 py-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        Submitted Assignment
                      </h4>
                      {isGraded && (
                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Graded
                        </div>
                      )}
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:border-indigo-300 transition-colors">
                      <iframe
                        src={submission.pdfUrl?.startsWith("data:")
                          ? submission.pdfUrl
                          : submission.pdfUrl}
                        title={`Assignment submission by ${studentName}`}
                        className="w-full h-[500px] md:h-[600px] lg:h-[700px]"
                        loading="lazy"
                      />
                    </div>
                    
                    <p className="mt-3 text-xs text-gray-500 text-center">
                      Scroll to review the entire document
                    </p>
                  </div>

                  {/* Grading Section */}
                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                    {isGraded ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <div className="flex items-start">
                          <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                          <div className="ml-3 flex-1">
                            <h5 className="font-bold text-green-800 mb-2">Assignment Graded</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Score</p>
                                <p className="text-2xl font-bold text-green-700">
                                  {submission.score}
                                  <span className="text-sm font-normal text-gray-500 ml-1">/ {submission.assignment?.maxMarks || '??'}</span>
                                </p>
                              </div>
                              {submission.remarks && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Feedback</p>
                                  <p className="text-sm text-gray-700 italic">
                                    "{submission.remarks}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : gradingId === submission._id ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-800 flex items-center">
                            <PencilIcon className="h-5 w-5 text-indigo-600 mr-2" />
                            Grade Assignment
                          </h5>
                          <button
                            onClick={() => {
                              setGradingId(null);
                              setScore("");
                              setRemarks("");
                              setError("");
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Cancel grading"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`score-${submission._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Score <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`score-${submission._id}`}
                              type="number"
                              min="0"
                              max={submission.assignment?.maxMarks || 100}
                              value={score}
                              onChange={(e) => setScore(e.target.value)}
                              placeholder={`e.g., ${submission.assignment?.maxMarks || 100}`}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                              aria-required="true"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Maximum: {submission.assignment?.maxMarks || '??'} points
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label htmlFor={`remarks-${submission._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Feedback (Optional)
                            </label>
                            <textarea
                              id={`remarks-${submission._id}`}
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Provide constructive feedback to help the student improve..."
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => submitGrade(submission._id)}
                            disabled={isSubmitting}
                            className={`flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white shadow-sm transition-all ${
                              isSubmitting
                                ? "bg-indigo-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            }`}
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving Grade...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                                Save Grade
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setGradingId(null);
                              setScore("");
                              setRemarks("");
                            }}
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                          >
                            <XMarkIcon className="-ml-1 mr-2 h-5 w-5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setGradingId(submission._id)}
                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
                      >
                        <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                        Grade This Assignment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
