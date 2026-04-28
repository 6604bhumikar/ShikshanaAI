import React from "react";
import { 
  Lock, 
  CheckCircle, 
  Award, 
  Trophy, 
  BookOpen,
  Circle,
  LockKeyhole,
  X
} from "lucide-react";

export default function LessonSidebar({
  units = [],
  activeUnit,
  activeLesson,
  onSelect,
  onQuizSelect,
  onFinalQuizSelect,
  finalQuizUnlocked = false,
  finalQuizAvailable = false,
  courseProgress,
  onClose // ✅ NEW: Callback for mobile close button
}) {
  // Calculate progress for each unit if not provided by parent
  const getUnitProgress = (unit) => {
    if (!unit?.lessons?.length) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = unit.lessons.filter(l => l.isCompleted).length;
    const total = unit.lessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  return (
    <aside className="
      flex flex-col 
      bg-white 
      h-full 
      lg:h-screen 
      lg:w-72 
      w-full 
      max-w-xs
      border-r border-gray-100 lg:border-r
    ">
      {/* ✅ MOBILE: Header with Close Button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-lg">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="font-bold text-gray-800 text-base">Course Content</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Desktop Header (unchanged) */}
      <div className="hidden lg:block px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-lg">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Course Content</h2>
        </div>
        {courseProgress && (
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${courseProgress.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{courseProgress.completed} lessons</span>
              <span>{courseProgress.percentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ MOBILE: Compact Progress (shown below header) */}
      {courseProgress && (
        <div className="lg:hidden px-4 py-2 border-b border-gray-100 bg-indigo-50/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Progress</span>
            <span className="font-bold text-indigo-600">{courseProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${courseProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2 custom-scrollbar">
        {units.map((unit, index) => {
          const unitId = unit?._id || `unit-${index}`;
          const isLocked = Boolean(unit?.isLocked);
          const hasQuiz = (unit?.quizCount ?? 0) > 0;
          const isCompleted = unit?.isCompleted === true;
          const unitProgress = getUnitProgress(unit);
          const isActiveUnit = activeUnit?._id === unit._id;

          return (
            <section
              key={unitId}
              className={`rounded-xl overflow-hidden border ${
                isLocked 
                  ? "border-gray-200 bg-gray-50/50" 
                  : isActiveUnit
                  ? "border-indigo-200 ring-1 ring-indigo-200 bg-indigo-50/30"
                  : "border-gray-100"
              }`}
            >
              {/* Unit Header - Simplified for Mobile */}
              <div 
                className={`px-3 py-2.5 ${
                  isLocked 
                    ? "bg-gray-100/50" 
                    : "bg-gradient-to-r from-indigo-50/50 to-purple-50/50"
                } border-b border-gray-100`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                      isLocked 
                        ? "bg-gray-200 text-gray-400" 
                        : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {index + 1}
                    </span>
                    <h3 className={`font-bold text-sm truncate ${isLocked ? "text-gray-400" : "text-gray-800"}`}>
                      {unit.title}
                    </h3>
                    {isLocked && (
                      <LockKeyhole className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  {/* Unit Completion Badge - Compact */}
                  {isCompleted && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      ✓
                    </span>
                  )}
                </div>
                
                {/* Unit Progress - Hidden on mobile to reduce clutter */}
                {!isLocked && (
                  <div className="hidden lg:block mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-green-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${unitProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                      <span>{unitProgress.completed}/{unitProgress.total}</span>
                      <span>{unitProgress.percentage}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Unit Content - Lessons List */}
              <div className="p-1.5 space-y-1 bg-white">
                {(unit.lessons || []).map((lesson) => {
                  const isActive = 
                    activeUnit?._id === unit._id && 
                    activeLesson?._id === lesson._id;
                  const isCompleted = lesson.isCompleted;
                  
                  return (
                    <button
                      key={lesson._id}
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) {
                          onSelect(unit, lesson);
                        }
                      }}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all
                        min-h-[44px] touch-manipulation
                        ${
                          isLocked
                            ? "bg-gray-100/50 text-gray-400 cursor-not-allowed"
                            : isActive
                            ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-sm"
                            : isCompleted
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        }
                      `}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {isActive ? (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        ) : isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      
                      {/* Lesson Title - Truncated */}
                      <span className="flex-1 text-sm font-medium line-clamp-1 min-w-0">
                        {lesson.title}
                      </span>
                      
                      {/* Completed Check - Hidden when active */}
                      {isCompleted && !isActive && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 hidden lg:block" />
                      )}
                    </button>
                  );
                })}

                {/* Unit Quiz Button - Compact */}
                {hasQuiz && !isLocked && (
                  <button
                    onClick={() => onQuizSelect(unit)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-200 min-h-[44px]"
                  >
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-sm">Unit Quiz</span>
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      {unit.quizCount}
                    </span>
                  </button>
                )}

                {/* Unit Completed Message - Minimal */}
                {isCompleted && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden lg:inline">Unit Completed</span>
                    <span className="lg:hidden">Done</span>
                  </div>
                )}

                {/* Locked Message - Minimal */}
                {isLocked && (
                  <div className="px-3 py-2 rounded-lg bg-gray-100/50 border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Complete previous unit to unlock
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Final Quiz Section - Mobile Optimized */}
      {finalQuizAvailable && finalQuizUnlocked && (
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <h3 className="font-bold text-gray-800 text-sm">Final Quiz</h3>
            </div>
            <button
              onClick={onFinalQuizSelect}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm transition-all text-sm min-h-[44px]"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden lg:inline">Start Final Quiz</span>
              <span className="lg:hidden">Final Quiz</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
