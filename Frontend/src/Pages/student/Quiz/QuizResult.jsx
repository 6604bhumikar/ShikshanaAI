import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { 
  TrophyIcon, 
  ArrowLeftIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/outline";

export default function QuizResult({ isMobile = false }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { courseId, unitId } = useParams();

  // 🔑 GET DATA FROM URL (passed explicitly by backend)
  const percentage = Number(params.get("percentage") || 0);
  const obtainedMarks = Number(params.get("obtainedMarks") || 0);
  const totalMarks = Number(params.get("totalMarks") || 0);
  const attemptNo = Number(params.get("attemptNo") || 1);
  const isCompleted = params.get("completed") === "true";
  const passed = params.get("passed") === "true";
  
  const [showContent, setShowContent] = useState(false);

  // 🎉 Celebration effect ONLY on new pass - Reduced on mobile
  useEffect(() => {
    setShowContent(true);
    
    if (passed && !isCompleted && !isMobile) {
      // Initial burst - reduced particles on mobile
      confetti({
        particleCount: isMobile ? 50 : 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
      });

      // Continuous celebration - disabled on mobile for performance
      if (!isMobile) {
        const interval = setInterval(() => {
          confetti({
            particleCount: 30,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#FFA500'],
          });
          confetti({
            particleCount: 30,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FF6347', '#9370DB'],
          });
        }, 2000);

        setTimeout(() => clearInterval(interval), 8000);
        return () => clearInterval(interval);
      }
    }
  }, [passed, isCompleted, isMobile]);

  // 🔑 CRITICAL FIX: CORRECT ROUTE PATHS
  const handleBackToCourse = () => {
    navigate(`/player/${courseId}`, { replace: true });
  };

  const handleRetake = () => {
    if (passed || !unitId || !courseId) return;
    navigate(`/student/courses/${courseId}/units/${unitId}/quiz`, { 
      replace: true 
    });
  };

  // 🔒 PREVENT RENDER IF MISSING CRITICAL PARAMS
  if (!courseId || !unitId) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 max-w-sm w-full text-center">
          <div className="flex justify-center mb-3">
            <XCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">Invalid Result</h2>
          <p className="text-gray-600 text-sm mb-4">Missing course information.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-semibold text-sm sm:text-base min-h-[48px] touch-manipulation"
          >
            <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    // ✅ FIXED: Full viewport, no scroll, touch-friendly
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-2 sm:p-3 touch-manipulation">
      <div 
        className={`w-full max-w-lg transition-all duration-500 transform ${
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Main Card - Flex layout, constrained height */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
          
          {/* Header Section - Fixed, doesn't scroll */}
          <div
            className={`${
              passed
                ? "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
                : "bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600"
            } p-4 sm:p-5 text-white text-center relative overflow-hidden flex-shrink-0`}
          >
            {/* Subtle Stars - Reduced on mobile */}
            {passed && !isMobile && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className="absolute opacity-20 animate-float"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      fontSize: `${6 + Math.random() * 4}px`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${15 + Math.random() * 10}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center justify-center">
              {passed ? (
                <>
                  <TrophyIcon className="w-12 h-12 sm:w-14 sm:h-14 mb-1.5 animate-bounce-slow" />
                  <h1 className="text-xl sm:text-2xl font-bold">Quiz Passed!</h1>
                  <p className="text-sm sm:text-base font-medium mt-0.5">Excellent Work!</p>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-12 h-12 sm:w-14 sm:h-14 mb-1.5" />
                  <h1 className="text-xl sm:text-2xl font-bold">Quiz Result</h1>
                  <p className="text-sm sm:text-base font-medium mt-0.5">Attempt #{attemptNo}</p>
                </>
              )}
            </div>
          </div>

          {/* Scrollable Content Section */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
            
            {/* Score Display - Compact */}
            <div className="text-center mb-3 sm:mb-4">
              <div className="inline-flex items-center justify-center relative">
                <div
                  className={`text-4xl sm:text-5xl font-bold ${
                    passed ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {percentage}%
                </div>
                {passed && (
                  <CheckCircleIcon className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 text-emerald-500 animate-pulse" />
                )}
              </div>
              
              {totalMarks > 0 && (
                <p className="text-gray-600 text-sm mt-1 font-medium">
                  {obtainedMarks} / {totalMarks} marks
                </p>
              )}

              {/* Slim Progress Bar */}
              <div className="mt-2 sm:mt-3">
                <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      passed
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                        : "bg-gradient-to-r from-rose-400 to-rose-600"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>Pass: 60%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Status Message - Compact */}
            <div 
              className={`${
                passed 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-amber-50 border-amber-200 text-amber-800"
              } border rounded-xl p-3 mb-3 sm:mb-4`}
            >
              <div className="flex items-start gap-2">
                {passed ? null : (
                  <ArrowPathIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  <h3 className="font-bold mb-0.5">
                    {passed ? "Great Job!" : "Keep Going!"}
                  </h3>
                  <p className="leading-tight">
                    {passed 
                      ? "You've mastered this unit. Continue your learning!" 
                      : "Review content and retry. Every attempt helps!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Full width, touch-friendly */}
            <div className="space-y-2 mb-3 sm:mb-4">
              {passed ? (
                <button
                  onClick={handleBackToCourse}
                  className="w-full group relative px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white rounded-xl font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all min-h-[48px] touch-manipulation"
                >
                  <div className="flex items-center justify-center gap-2">
                    <DocumentCheckIcon className="w-4 h-4" />
                    <span>Continue Course</span>
                  </div>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRetake}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation disabled:opacity-60"
                    disabled={!unitId || !courseId}
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Retake (#{attemptNo + 1})</span>
                  </button>
                  <button
                    onClick={handleBackToCourse}
                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 border border-gray-200 min-h-[48px] touch-manipulation"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Review Lessons</span>
                  </button>
                </>
              )}
            </div>

            {/* Compact Stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] sm:text-xs">
              {passed && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-lg p-2 border border-indigo-100">
                  <div className="flex items-center justify-center gap-1">
                    <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-indigo-700">Unit Done</span>
                  </div>
                </div>
              )}
              <div className={`rounded-lg p-2 ${
                passed 
                  ? "bg-emerald-50 border border-emerald-100" 
                  : "bg-rose-50 border border-rose-100"
              }`}>
                <div className="font-semibold">
                  {passed ? (
                    <>
                      <CheckCircleIcon className="w-3 h-3 text-emerald-500 inline mr-0.5" />
                      Passed {percentage}%
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-3 h-3 text-rose-500 inline mr-0.5" />
                      Need 60%
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tip for Failed Attempts - Minimal */}
            {!passed && (
              <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] sm:text-xs text-blue-800 leading-tight">
                  💡 <span className="font-bold">Tip:</span> Retake unlimited times. Focus on missed questions!
                </p>
              </div>
            )}

            {/* Motivational Quote - Minimal */}
            <div className="mt-3 pt-2 border-t border-gray-100 text-center">
              <p className="text-[10px] sm:text-xs italic text-gray-600 leading-tight">
                {passed
                  ? '"Success is small efforts repeated."'
                  : '"The expert was once a beginner."'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
