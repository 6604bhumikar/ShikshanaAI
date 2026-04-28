import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { MathJax } from "better-react-mathjax";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ClockIcon,
  DocumentCheckIcon,
  CircleStackIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

const API =
  import.meta.env.VITE_API_STUDENT ||
  "http://localhost:5000/api/student";

export default function AttemptQuiz({ isMobile = false }) {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const isFinalQuiz = !unitId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navScrollRef = useRef(null);

  /* ==========================
        FETCH QUIZ
  ========================== */
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const url = isFinalQuiz
        ? `${API}/courses/${courseId}/final-quiz`
        : `${API}/courses/${courseId}/units/${unitId}/quiz`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.quizCompleted && res.data.passed) {
        navigate(
          `/student/courses/${courseId}/units/${unitId}/quiz/result?` +
          `percentage=${res.data.percentage || 0}&` +
          `passed=true&` +
          `completed=true`,
          { replace: true }
        );
        return;
      }

      if (!res.data.quiz) {
        setError("Quiz unavailable. Please contact support.");
        setQuiz(null);
        return;
      }

      setQuiz(res.data.quiz);
      setAnswers({});
      
      if (res.data.quiz?.duration) {
        const durationMs = res.data.quiz.duration * 60 * 1000;
        setTimeRemaining(durationMs);
        
        const timer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1000) {
              clearInterval(timer);
              handleSubmit(new Event('submit'));
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    } catch (err) {
      console.error("Fetch quiz error:", err);
      setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && token) fetchQuiz();
  }, [courseId, unitId, token]);

  /* ==========================
        UPDATE ANSWER
  ========================== */
  const updateAnswer = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  /* ==========================
        NAVIGATION
  ========================== */
  const goToQuestion = (index) => {
    if (index >= 0 && index < quiz.questions.length) {
      setCurrentQuestion(index);
      // Scroll to top of question on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  /* ==========================
        SUBMIT QUIZ
  ========================== */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!quiz || saving) return;

    if (!window.confirm("Submit this quiz? Changes can't be made after submission.")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formattedAnswers = quiz.questions.map((q, index) => ({
        questionId: q._id,
        answer: answers[index] ?? "",
      }));

      const submitUrl = isFinalQuiz
        ? `${API}/courses/${courseId}/final-quiz`
        : `${API}/courses/${courseId}/units/${unitId}/quiz/submit`;

      const res = await axios.post(
        submitUrl,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { percentage, obtainedMarks, totalMarks, passed } = res.data;
      
      navigate(
        `/student/courses/${courseId}/units/${unitId}/quiz/result?` +
        `percentage=${percentage || 0}&` +
        `obtainedMarks=${obtainedMarks || 0}&` +
        `totalMarks=${totalMarks || 0}&` +
        `passed=${passed}&` +
        `attemptNo=${res.data.attemptNo || 1}`,
        { replace: true }
      );
    } catch (err) {
      console.error("Submit quiz error:", err);
      
      if (err.response?.status === 403 && err.response.data.passed) {
        navigate(
          `/student/courses/${courseId}/units/${unitId}/quiz/result?` +
          `percentage=${err.response.data.percentage || 0}&` +
          `passed=true&` +
          `completed=true`,
          { replace: true }
        );
        return;
      }
      
      setError(err.response?.data?.message || "Failed to submit quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================
        FORMATTING HELPERS
  ========================== */
  const formatTime = (ms) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      mcq: "Multiple Choice",
      multi: "Multiple Select",
      true_false: "True/False",
      code: "Coding Problem",
      text: "Text Answer",
      fill: "Fill in the Blank",
      short_answer: "Short Answer"
    };
    return labels[type] || "Question";
  };

  /* ==========================
        LOADING STATE - Mobile Optimized
  ========================== */
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-gray-600 font-medium text-sm sm:text-base">Preparing your quiz...</p>
      </div>
    </div>
  );
  
  /* ==========================
        ERROR STATE - Mobile Optimized
  ========================== */
  if (error && !quiz) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-center">
        <XCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Quiz Unavailable</h3>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors min-h-[48px]"
        >
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (!quiz) return null;

  const currentQuestionData = quiz.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24 sm:pb-8">
      
      {/* Sticky Header - Mobile Optimized */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="px-3 sm:px-4 py-3">
          {/* Top Row: Title + Timer */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                {isFinalQuiz ? "🏁 Final Quiz" : "📝 Unit Quiz"}
              </h2>
              {!isFinalQuiz && (
                <p className="text-indigo-600 text-xs">Attempt {quiz.attemptNo}</p>
              )}
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg flex-shrink-0">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span className="font-mono text-sm font-bold">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-600 mb-1">
              <span>Q{currentQuestion + 1}/{quiz.questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
        
        {/* Question Navigation - Horizontal Scroll on Mobile */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Questions</h3>
          </div>
          
          <div 
            ref={navScrollRef}
            className="p-3 overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-2 min-w-max">
              {quiz.questions.map((_, index) => {
                const isCurrent = index === currentQuestion;
                const isAnswered = answers[index] !== undefined && answers[index] !== '';
                
                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-medium text-xs sm:text-sm transition-all flex-shrink-0 flex items-center justify-center min-h-[40px] min-w-[40px] ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-md"
                        : isAnswered
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    aria-label={`Go to question ${index + 1}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Question Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          {/* Question Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                  {currentQuestion + 1}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {getQuestionTypeLabel(currentQuestionData.type).split(' ')[0]}
                  </span>
                  {currentQuestionData.points && (
                    <span className="ml-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      {currentQuestionData.points} pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            {/* Question Text */}
            <div className="prose prose-indigo prose-sm max-w-none">
              <MathJax dynamic>
                <div className="text-gray-900 leading-relaxed text-sm sm:text-base break-words">
                  {currentQuestionData.question}
                </div>
              </MathJax>
            </div>

            {/* Answer Options */}
            <div className="mt-5 space-y-3">
              {/* MCQ */}
              {currentQuestionData.type === "mcq" && (
                <div className="space-y-2.5">
                  {currentQuestionData.options?.map((opt, idx) => {
                    const isSelected = answers[currentQuestion] === opt.text;
                    return (
                      <label
                        key={idx}
                        className={`flex items-start p-3 sm:p-4 border rounded-xl cursor-pointer transition-all min-h-[48px] touch-manipulation ${
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" 
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            checked={isSelected}
                            onChange={() => updateAnswer(currentQuestion, opt.text)}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <MathJax dynamic>
                            <span className="font-medium text-gray-900 text-sm break-words">{opt.text}</span>
                          </MathJax>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              
              {/* Multiple Select */}
              {currentQuestionData.type === "multi" && (
                <div className="space-y-2.5">
                  {currentQuestionData.options?.map((opt, idx) => {
                    const isSelected = (answers[currentQuestion] || []).includes(opt.text);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start p-3 sm:p-4 border rounded-xl cursor-pointer transition-all min-h-[48px] touch-manipulation ${
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" 
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const prev = answers[currentQuestion] || [];
                              updateAnswer(
                                currentQuestion,
                                e.target.checked
                                  ? [...prev, opt.text]
                                  : prev.filter((v) => v !== opt.text)
                              );
                            }}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <MathJax dynamic>
                            <span className="font-medium text-gray-900 text-sm break-words">{opt.text}</span>
                          </MathJax>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              
              {/* True/False - Full width buttons on mobile */}
              {currentQuestionData.type === "true_false" && (
                <div className="grid grid-cols-2 gap-2.5">
                  {["true", "false"].map((val) => {
                    const isSelected = answers[currentQuestion] === val;
                    return (
                      <label
                        key={val}
                        className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all min-h-[56px] ${
                          isSelected
                            ? "border-green-500 bg-green-50 text-green-800 font-medium"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          checked={isSelected}
                          onChange={() => updateAnswer(currentQuestion, val)}
                          className="sr-only"
                        />
                        <span className="text-sm sm:text-base font-bold uppercase">{val}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              
              {/* Code - Full width textarea */}
              {currentQuestionData.type === "code" && (
                <div>
                  <textarea
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => updateAnswer(currentQuestion, e.target.value)}
                    placeholder="Enter your code..."
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-gray-50 text-sm sm:text-base"
                    aria-label="Code solution"
                  />
                  {answers[currentQuestion] && (
                    <p className="mt-2 text-xs text-gray-500 text-right">
                      {answers[currentQuestion].length} characters
                    </p>
                  )}
                </div>
              )}
              
              {/* Text/Fill/Short Answer */}
              {!["mcq", "multi", "true_false", "code"].includes(currentQuestionData.type) && (
                <div>
                  <input
                    type="text"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => updateAnswer(currentQuestion, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base min-h-[48px]"
                    aria-label="Text answer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar - Mobile Optimized */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 z-30 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:z-auto">
          <div className="max-w-4xl mx-auto">
            {/* Desktop: Inline buttons, Mobile: Stacked */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Navigation Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm min-h-[44px] min-w-[44px] sm:min-w-auto"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px] min-w-[44px] sm:min-w-auto"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                <button
                  onClick={nextQuestion}
                  disabled={isLastQuestion}
                  className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px] min-w-[44px] sm:min-w-auto"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              {/* Submit Button - Full width on mobile */}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white transition-all min-h-[48px] touch-manipulation ${
                  saving
                    ? "bg-gray-400 cursor-wait"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-[0.99]"
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <DocumentCheckIcon className="-ml-1 mr-1.5 h-4 w-4" />
                    Submit Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer Tip - Hidden on mobile to save space */}
        <div className="hidden sm:block mt-6 text-center text-sm text-gray-600 max-w-2xl mx-auto">
          <p className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <span className="font-medium text-indigo-600">Tip:</span> Navigate between questions using the panel above. Answers save automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
