import React, { useEffect, useState } from "react";
import { studentAPI } from "@/lib/api";
import { 
  MessageCircle, 
  Clock, 
  AlertCircle, 
  Loader,
  CheckCircle,
  User,
  SendHorizonal
} from "lucide-react";

export default function QnAPanel({ courseId, lesson, isMobile = false }) {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  /* =====================
     LOAD Q&A
  ===================== */
  const loadQnA = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError("");
      
      const res = await studentAPI.get(`/courses/${courseId}/qna`);
      
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.questions || [];
        
      setQuestions(list);
    } catch (err) {
      console.error("Failed to load Q&A", err);
      setError("Failed to load questions. Please try again later.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQnA();
  }, [courseId]);

  /* =====================
     ASK QUESTION
  ===================== */
  const askQuestion = async () => {
    if (!text.trim() || !courseId || posting) return;

    try {
      setPosting(true);
      setError("");
      
      await studentAPI.post(`/courses/${courseId}/qna`, {
        question: text.trim(),
        lessonId: lesson?._id || null,
      });

      setText("");
      await loadQnA();
    } catch (err) {
      console.error("Failed to post question", err);
      setError(err.response?.data?.message || "Failed to submit question. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  /* =====================
     FORMAT TIMESTAMP - Simplified for Mobile
  ===================== */
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = Math.round(diffHours * 60);
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${Math.round(diffHours)}h ago`;
    }
    // Mobile: shorter date format
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: isMobile ? undefined : 'numeric'
    });
  };

  return (
    <div className="w-full">
      {/* Header - MOBILE OPTIMIZED */}
      <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="bg-indigo-100 p-2 rounded-xl sm:p-2.5 flex-shrink-0">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
            Course Q&A
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            Ask questions, get answers
          </p>
          {lesson && (
            <div className="mt-1">
              <span className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{lesson.title}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Card - MOBILE SIMPLIFIED */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-8">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Ask a Question</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
            Instructors typically respond within 24 hours
          </p>
        </div>
        
        <div className="p-4 sm:p-5">
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 text-red-700 rounded-lg flex items-start sm:items-center gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span>{error}</span>
            </div>
          )}
          
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askQuestion();
              }
            }}
            className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[90px] sm:min-h-[100px] resize-y text-sm sm:text-base"
            placeholder="Type your question..."
            aria-label="Question input"
          />
          
          <div className="mt-3 sm:mt-4 flex justify-end">
            <button
              onClick={askQuestion}
              disabled={posting || !text.trim()}
              className={`w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 min-h-[44px] touch-manipulation ${
                posting || !text.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-sm active:scale-[0.99]"
              }`}
            >
              {posting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendHorizonal className="w-4 h-4" />
                  Ask
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          // Skeleton Loaders - Mobile Optimized
          <>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
              >
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3 mb-2 sm:mb-3"></div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-full mb-1.5 sm:mb-2"></div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-4/5 mb-3 sm:mb-4"></div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </>
        ) : questions.length === 0 ? (
          // Empty State - Simplified
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-indigo-50 mb-3 sm:mb-4">
              <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">No questions yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto px-2">
              Be the first to ask! Instructors monitor this space and will respond to your questions.
            </p>
            <div className="mt-4 sm:mt-6 flex justify-center">
              <button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                Ask Question
              </button>
            </div>
          </div>
        ) : (
          // Questions List - Single column, optimized cards
          <div className="space-y-3 sm:space-y-4">
            {questions.map((q) => (
              <article
                key={q._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-700 font-bold text-xs sm:text-sm">
                            {q.student?.name?.charAt(0) || 'S'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="font-semibold text-gray-800 text-sm truncate">
                            {q.student?.name || 'Student'}
                          </span>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {formatTime(q.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-4 sm:line-clamp-none">
                          {q.question}
                        </p>
                      </div>
                    </div>
                    
                    {/* Answered Badge - Compact */}
                    {q.reply && (
                      <span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Answered</span>
                      </span>
                    )}
                  </div>

                  {/* Reply Section */}
                  <div className="mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    {q.reply ? (
                      // Instructor Reply - Simplified
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-700 font-bold text-xs sm:text-sm">I</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 bg-indigo-50/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-indigo-100">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-bold text-indigo-800 text-xs sm:text-sm flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              Instructor
                            </span>
                            {q.updatedAt && (
                              <span className="text-[10px] text-indigo-600">
                                • {formatTime(q.updatedAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-sm">
                            {q.reply}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Pending Status - Compact
                      <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-amber-700 font-medium">
                          Awaiting response
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}