import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { studentAPI } from "@/lib/api";
import confetti from "canvas-confetti";
import { 
  Trophy, Award, Download, RotateCcw, ArrowLeft, Star, 
  CheckCircle, XCircle, Medal 
} from "lucide-react";

export default function FinalQuizResult({ isMobile = false }) {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  /* ✅ READ PERCENTAGE */
  const percentage = Number(searchParams.get("percentage") || 0);
  const obtainedMarks = Number(searchParams.get("obtainedMarks") || 0);
  const totalMarks = Number(searchParams.get("totalMarks") || 0);
  const passed = percentage >= 60;

  /* ===================== CELEBRATION EFFECTS ===================== */
  useEffect(() => {
    setShowContent(true);
    
    if (passed && !isMobile) {
      // Initial burst - reduced on mobile for performance
      confetti({
        particleCount: isMobile ? 50 : 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
      });

      // Continuous celebration - disabled on mobile
      if (!isMobile) {
        const interval = setInterval(() => {
          confetti({
            particleCount: 25,
            angle: 60,
            spread: 55,
            origin: { x: 0.1 },
            colors: ['#FFD700', '#FFA500'],
          });
          confetti({
            particleCount: 25,
            angle: 120,
            spread: 55,
            origin: { x: 0.9 },
            colors: ['#FF6347', '#9370DB'],
          });
        }, 2500);

        return () => clearInterval(interval);
      }
    }
  }, [passed, isMobile]);

  /* ===================== GENERATE CERTIFICATE ===================== */
  const handleGenerateCertificate = async () => {
    if (!passed) {
      alert("You must pass the final quiz to generate certificate.");
      return;
    }

    try {
      setLoading(true);
      
      const res = await studentAPI.post(`/certificates/generate/${courseId}`);
      const certificate = res.data?.certificate;
      
      if (!certificate?.filePath) {
        alert("⚠️ Certificate generated but file is missing. Please try again.");
        navigate("/student/certificates", { replace: true });
        return;
      }

      // Celebration burst - reduced on mobile
      if (!isMobile) {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
        });
      }

      alert("🎉 Certificate generated successfully! Redirecting to your certificates...");
      navigate("/student/certificates", { replace: true });
    } catch (err) {
      console.error("Generate Cert Error:", err);
      alert(err?.response?.data?.message || "Failed to generate certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ FIXED: Full viewport height, no scroll, touch-friendly
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-2 sm:p-3 touch-manipulation">
      <div 
        className={`w-full max-w-lg transition-all duration-500 transform ${
          showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Main Card - Compact, No Scroll */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
          
          {/* Header Section - Fixed Height */}
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
                  <Star
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
                  <Trophy className="w-12 h-12 sm:w-14 sm:h-14 mb-1.5 animate-bounce-slow" />
                  <h1 className="text-xl sm:text-2xl font-bold">Congratulations!</h1>
                  <p className="text-sm sm:text-base font-medium mt-0.5">Course Completed</p>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 sm:w-14 sm:h-14 mb-1.5" />
                  <h1 className="text-xl sm:text-2xl font-bold">Almost There!</h1>
                  <p className="text-sm sm:text-base font-medium mt-0.5">Review & Retry</p>
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
                  <CheckCircle className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 text-emerald-500 animate-pulse" />
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

            {/* Compact Status Message */}
            <div 
              className={`${
                passed 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-amber-50 border-amber-200 text-amber-800"
              } border rounded-xl p-3 mb-3 sm:mb-4`}
            >
              <div className="flex items-start gap-2">
                {passed ? (
                  <Award className="w-6 h-6 flex-shrink-0 mt-0.5" />
                ) : (
                  <RotateCcw className="w-6 h-6 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  <h3 className="font-bold mb-0.5">
                    {passed ? "Great Job!" : "Keep Going!"}
                  </h3>
                  <p className="leading-tight">
                    {passed 
                      ? "Your certificate is ready to celebrate this milestone!" 
                      : "Review the content and retake the quiz. You've got this!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Compact, Full Width */}
            <div className="space-y-2 mb-3 sm:mb-4">
              {passed ? (
                <button
                  onClick={handleGenerateCertificate}
                  disabled={loading}
                  className="w-full group relative px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white rounded-xl font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all disabled:opacity-70 min-h-[48px] touch-manipulation"
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Certificate</span>
                      </>
                    )}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/student/courses/${courseId}/final-quiz`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </button>
              )}

              <button
                onClick={() => navigate(`/student/courses/${courseId}`, { replace: true })}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 border border-gray-200 min-h-[48px] touch-manipulation"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </button>
            </div>

            {/* Compact Stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] sm:text-xs">
              {passed && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-lg p-2 border border-indigo-100">
                  <div className="flex items-center justify-center gap-1">
                    <Medal className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-indigo-700">Certificate</span>
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
                      <CheckCircle className="w-3 h-3 text-emerald-500 inline mr-0.5" />
                      Passed {percentage}%
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-500 inline mr-0.5" />
                      Need 60%
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quote - Minimal */}
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