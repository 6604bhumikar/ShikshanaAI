import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Target,
  Upload,
  Award,
  FileText,
  AlertCircle,
  Loader,
  Trash2,
  MessageSquare,
  ChevronDown
} from "lucide-react";

export default function AssignmentsTab({ assignments = [], courseId, isMobile = false }) {
  const token = localStorage.getItem("accessToken");
  const API = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";

  const [uploadingId, setUploadingId] = useState(null);
  const [fileMap, setFileMap] = useState({});
  const [errors, setErrors] = useState({});
  const [expandedReqs, setExpandedReqs] = useState({});

  // Format date - simplified for mobile
  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return "No due date";
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;
      if (diffDays === 0) return "Due today";
      if (diffDays === 1) return "Due tomorrow";
      if (diffDays <= 7) return `Due in ${diffDays}d`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: isMobile ? undefined : 'numeric'
      });
    };
  }, [isMobile]);

  const submitPdf = async (assignmentId) => {
    const file = fileMap[assignmentId];
    if (!file) {
      setErrors(prev => ({ ...prev, [assignmentId]: "Please select a PDF file" }));
      return;
    }

    if (file.type !== "application/pdf") {
      setErrors(prev => ({ ...prev, [assignmentId]: "Only PDF files allowed" }));
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [assignmentId]: "File must be under 25MB" }));
      return;
    }

    try {
      setUploadingId(assignmentId);
      setErrors(prev => ({ ...prev, [assignmentId]: null }));

      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      await axios.post(
        `${API}/assignments/${assignmentId}/submit`,
        {
          fileName: file.name,
          fileData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setErrors(prev => ({ ...prev, [assignmentId]: "✅ Submitted!" }));
      
      setTimeout(() => {
        setFileMap(prev => ({ ...prev, [assignmentId]: null }));
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Upload failed", err);
      const errorMsg = err.response?.data?.message || "Failed to submit. Try again.";
      setErrors(prev => ({ ...prev, [assignmentId]: `❌ ${errorMsg}` }));
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileChange = (assignmentId, e) => {
    const file = e.target.files[0];
    if (file) {
      setErrors(prev => ({ ...prev, [assignmentId]: null }));
      setFileMap(prev => ({ ...prev, [assignmentId]: file }));
    }
  };

  const removeFile = (assignmentId) => {
    setFileMap(prev => ({ ...prev, [assignmentId]: null }));
    setErrors(prev => ({ ...prev, [assignmentId]: null }));
  };

  const confirmSubmission = (assignmentId) => {
    if (window.confirm("Submit this assignment? Changes can't be made after submission.")) {
      submitPdf(assignmentId);
    }
  };

  const toggleRequirements = (assignmentId) => {
    setExpandedReqs(prev => ({ ...prev, [assignmentId]: !prev[assignmentId] }));
  };

  const getRequirements = (description = "") =>
    description
      .split(/(?:\r?\n|\r|^)-\s+/)
      .filter(
        (item) =>
          item.trim().length > 5 &&
          !item.toLowerCase().includes("submission instructions")
      )
      .map((item) => item.trim());

  if (!assignments.length) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mx-auto flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-indigo-50 mb-3 sm:mb-4">
          <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">No Assignments</h2>
        <p className="text-gray-600 text-sm max-w-sm mx-auto">
          No assignments available yet. Check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header - MOBILE OPTIMIZED */}
      <div className="flex items-start sm:items-center gap-3 mb-5 sm:mb-8">
        <div className="bg-indigo-100 p-2 rounded-xl sm:p-2.5 flex-shrink-0">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
            Course Assignments
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-2">
            Submit PDF files. Instructors will review and provide feedback.
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {assignments.map((a) => {
          const submission = a.submission || null;
          const isSubmitted = submission?.status === "submitted" || submission?.status === "graded";
          const isGraded = submission?.status === "graded";
          const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && !isSubmitted;
          
          const requirements = getRequirements(a.description);

          return (
            <article
              key={a._id}
              className={`bg-white rounded-xl sm:rounded-2xl border ${
                isOverdue && !isSubmitted 
                  ? "border-rose-200 bg-rose-50/50" 
                  : isGraded 
                  ? "border-emerald-100 bg-emerald-50/50" 
                  : "border-gray-100"
              } overflow-hidden shadow-sm`}
            >
              {/* Status Bar */}
              <div className={`h-1 ${
                isOverdue && !isSubmitted ? 'bg-rose-500' : 
                isGraded ? 'bg-emerald-500' : 
                'bg-indigo-600'
              }`}></div>
              
              {/* Header */}
              <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-gray-100">
                <div className="flex flex-col gap-3">
                  {/* Title + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900 text-base sm:text-xl line-clamp-2 flex-1 min-w-0">
                      {a.title}
                    </h3>
                    <div className="flex-shrink-0">
                      {isGraded ? (
                        <span className="px-2.5 py-1 text-[10px] sm:text-sm font-medium rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span className="hidden sm:inline">Graded</span>
                        </span>
                      ) : isSubmitted ? (
                        <span className="px-2.5 py-1 text-[10px] sm:text-sm font-medium rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">Submitted</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="px-2.5 py-1 text-[10px] sm:text-sm font-medium rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] sm:text-sm font-medium rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(a.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Description - Truncated on mobile */}
                  {a.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {a.description.split("Submission instructions:")[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Requirements - Collapsible on mobile */}
              {requirements.length > 0 && (
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => toggleRequirements(a._id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-800 text-sm">Requirements</h4>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedReqs[a._id] ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {(expandedReqs[a._id] || !isMobile) && (
                    <ul className="mt-3 space-y-2 pl-6">
                      {requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="break-words">{req}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Submission Section - Simplified for Mobile */}
              {!isSubmitted && (
                <div className="p-4 sm:p-5 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Submit Assignment</h4>
                  </div>
                  
                  {errors[a._id] && (
                    <div className={`mb-3 p-2.5 sm:p-3 rounded-lg flex items-start sm:items-center gap-2 text-xs sm:text-sm ${
                      errors[a._id].includes('✅') 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {errors[a._id].includes('✅') ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                      )}
                      <span>{errors[a._id]}</span>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {/* File Upload Area */}
                    <div className="min-w-0">
                      {fileMap[a._id] ? (
                        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">{fileMap[a._id].name}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {(fileMap[a._id].size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(a._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            aria-label="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-xl border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all">
                          <div className="text-center px-2">
                            <div className="mx-auto flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-indigo-100 mb-2">
                              <Upload className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-indigo-600" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                              <span className="text-indigo-600">Tap to upload</span>
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">PDF only, max 25MB</p>
                          </div>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(a._id, e)}
                          />
                        </label>
                      )}
                    </div>
                    
                    {/* Submit Button - Full width on mobile */}
                    <button
                      onClick={() => confirmSubmission(a._id)}
                      disabled={uploadingId === a._id || !fileMap[a._id]}
                      className={`w-full px-4 py-3 rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation ${
                        uploadingId === a._id || !fileMap[a._id]
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-sm active:scale-[0.99]"
                      }`}
                    >
                      {uploadingId === a._id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Submit PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Graded Submission - Simplified */}
              {isGraded && (
                <div className="p-4 sm:p-5 bg-emerald-50/50 border-t border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-bold text-emerald-800 text-sm">Graded</h4>
                        <span className="px-2 py-0.5 bg-white text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                          {submission.score}/{a.maxMarks}
                        </span>
                      </div>
                      
                      {submission.remarks && (
                        <div className="mt-2 p-3 bg-white border border-emerald-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 text-sm italic leading-relaxed break-words">
                              {submission.remarks}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-emerald-700">
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                        {submission.gradedAt && (
                          <span>• Graded: {new Date(submission.gradedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer - Compact on mobile */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-sm text-gray-600">
                {a.maxMarks && (
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Max: {a.maxMarks}
                  </span>
                )}
                {a.dueDate && (
                  <span className={`flex items-center gap-1 ${
                    isOverdue && !isSubmitted ? "text-rose-600 font-medium" : ""
                  }`}>
                    <CalendarDays className="w-3 h-3" />
                    Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {isSubmitted && !isGraded && (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Submitted
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
