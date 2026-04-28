import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MathJax } from "better-react-mathjax";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  DocumentCheckIcon,
  ClockIcon,
  ArrowLeftIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

const API =
  import.meta.env.VITE_API_STUDENT ||
  "http://localhost:5000/api/student";

export default function StudentFinalQuiz({ isMobile = false }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navScrollRef = useRef(null);

  useEffect(() => {
    fetchFinalQuiz();
  }, [courseId]);

  /* ================= FETCH FINAL QUIZ ================= */
  const fetchFinalQuiz = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/courses/${courseId}/final-quiz`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setQuiz(res.data.quiz);
      setCurrentQuestionIndex(0);
      setAnswers({});
      
      if (res.data.quiz?.duration) {
        const durationMs = res.data.quiz.duration * 60 * 1000;
        setTimeRemaining(durationMs);
        
        const timer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1000) {
              clearInterval(timer);
              handleSubmit();
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load final quiz. Please try again later.");
    } finally {
      setLoading(false);
    }
  };  

  /* ================= HANDLE ANSWER ================= */
  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  /* ================= NAVIGATION ================= */
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  /* ================= SUBMIT FINAL QUIZ ================= */
  const handleSubmit = async () => {
    if (submitting) return;
    
    if (!window.confirm("Submit this final quiz? Changes can't be made after submission.")) {
      return;
    }

    try {
      setSubmitting(true);
      
      const formattedAnswers = quiz.questions.map((_, index) => ({
        answer: answers[index] ?? "",
      }));

      const res = await axios.post(
        `${API}/courses/${courseId}/final-quiz`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { percentage, passed } = res.data;
      
      setTimeRemaining(0);
      
      setTimeout(() => {
        navigate(
          `/student/courses/${courseId}/final-quiz/result?percentage=${percentage}&passed=${passed}`
        );
      }, 1500);
    } catch (err) {
      console.error("FINAL QUIZ SUBMIT ERROR:", err);
      setError(err.response?.data?.message || "Failed to submit final quiz. Please try again.");
      setSubmitting(false);
    }
  };

  /* ================= FORMATTING HELPERS ================= */
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
      true_false: "True/False",
      fill_blank: "Fill Blank",
      short_answer: "Short Answer",
      long_answer: "Long Answer",
      coding: "Coding"
    };
    return labels[type] || "Question";
  };

  /* ================= LOADING STATE - Mobile Optimized ================= */
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-gray-600 font-medium text-sm sm:text-base">Preparing your final assessment...</p>
      </div>
    </div>
  );
  
  /* ================= ERROR STATE - Mobile Optimized ================= */
  if (error) return (
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
  
  if (!quiz || !quiz.questions?.length) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-center">
        <DocumentCheckIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Questions</h3>
        <p className="text-gray-600 text-sm mb-4">
          This final assessment doesn't contain any questions. Please contact your instructor.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors min-h-[48px]"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24 sm:pb-8">
      
      {/* Sticky Header - Mobile Optimized */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="px-3 sm:px-4 py-3">
          {/* Top Row: Title + Timer */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                🏁 Final Assessment
              </h1>
              <p className="text-indigo-600 text-xs truncate">{quiz?.title || 'Course'}</p>
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
              <span>Q{currentQuestionIndex + 1}/{quiz.questions.length}</span>
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

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
        
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
                const isCurrent = index === currentQuestionIndex;
                const isAnswered = answers[index] !== undefined && answers[index] !== '';
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      if (window.innerWidth < 768) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
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
                  {currentQuestionIndex + 1}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {getQuestionTypeLabel(currentQuestion.type)}
                  </span>
                  {currentQuestion.points && (
                    <span className="ml-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      {currentQuestion.points} pts
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
                  {currentQuestion.question}
                </div>
              </MathJax>
            </div>

            {/* Answer Options */}
            <div className="mt-5 space-y-3">
              {/* MCQ */}
              {currentQuestion.type === "mcq" && (
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const value = typeof opt === "string" ? opt : opt.text;
                    const isSelected = answers[currentQuestionIndex] === value;
                    
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
                            name={`question-${currentQuestionIndex}`}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(value)}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <MathJax dynamic>
                            <span className="font-medium text-gray-900 text-sm break-words">{value}</span>
                          </MathJax>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              
              {/* True/False - Full width buttons on mobile */}
              {currentQuestion.type === "true_false" && (
                <div className="grid grid-cols-2 gap-2.5">
                  {["true", "false"].map((val) => {
                    const isSelected = answers[currentQuestionIndex] === val;
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
                          name={`question-${currentQuestionIndex}`}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(val)}
                          className="sr-only"
                        />
                        <span className="text-sm sm:text-base font-bold uppercase">{val}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              
              {/* Fill in the Blank */}
              {currentQuestion.type === "fill_blank" && (
                <div>
                  <input
                    type="text"
                    value={answers[currentQuestionIndex] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base min-h-[48px]"
                    aria-label="Fill in the blank answer"
                  />
                </div>
              )}
              
              {/* Short/Long/Coding Answers */}
              {(currentQuestion.type === "short_answer" || 
                currentQuestion.type === "long_answer" || 
                currentQuestion.type === "coding") && (
                <div>
                  <textarea
                    value={answers[currentQuestionIndex] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder={
                      currentQuestion.type === "coding"
                        ? "Write your code..."
                        : currentQuestion.type === "long_answer"
                        ? "Write a detailed response..."
                        : "Write a concise answer..."
                    }
                    rows={currentQuestion.type === "coding" ? 10 : currentQuestion.type === "long_answer" ? 6 : 4}
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${
                      currentQuestion.type === "coding" ? "font-mono bg-gray-50" : ""
                    }`}
                    aria-label={`${getQuestionTypeLabel(currentQuestion.type)} response`}
                  />
                  {answers[currentQuestionIndex] && (
                    <p className="mt-2 text-xs text-gray-500 text-right">
                      {answers[currentQuestionIndex].length} characters
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar - Mobile Optimized */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 z-30 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:z-auto">
          <div className="max-w-3xl mx-auto">
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
                  onClick={goToPrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px] min-w-[44px] sm:min-w-auto"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                {!isLastQuestion && (
                  <button
                    onClick={goToNext}
                    className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px] min-w-[44px] sm:min-w-auto"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </button>
                )}
              </div>
              
              {/* Submit Button - Full width on mobile, only on last question */}
              {isLastQuestion && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white transition-all min-h-[48px] touch-manipulation ${
                    submitting
                      ? "bg-gray-400 cursor-wait"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-[0.99]"
                  }`}
                >
                  {submitting ? (
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
              )}
            </div>
            
            {/* Hint text when not on last question */}
            {!isLastQuestion && (
              <p className="text-center text-xs text-gray-500 mt-2 sm:hidden">
                Navigate to the last question to submit
              </p>
            )}
          </div>
        </div>
        
        {/* Footer Tip - Hidden on mobile */}
        <div className="hidden sm:block mt-6 text-center text-sm text-gray-600 max-w-2xl mx-auto">
          <p className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <span className="font-medium text-indigo-600">Tip:</span> Navigate freely between questions. Answers save automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
