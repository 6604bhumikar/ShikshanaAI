import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import LessonSidebar from "./LessonSidebar";
import AssignmentsTab from "./AssignmentsTab";
import QnAPanel from "./QnAPanel";
import AnnouncementsPanel from "./AnnouncementsPanel";
import NotesPanel from "./NotesPanel";
import ResourceDisplay from "./ResourceDisplay";

import AnimatedBackground from "@/components/AnimatedBackground";
import { studentAPI } from "@/lib/api";
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Award,
  Lightbulb,
  Bell,
  ClipboardList,
  MessageCircle,
  PlayCircle,
  Lock,
  Trophy,
  ArrowLeft,
  GraduationCap,
  Menu,
  X
} from "lucide-react";

export default function CoursePlayer() {
  const { courseId, unitId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [assignments, setAssignments] = useState([]);
  const [qna, setQna] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ✅ FIXED: Renamed state variable to avoid conflict with function
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  
  // ✅ MOBILE: Sidebar drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hasAutoSelectedRef = useRef(false);
  const notificationTimerRef = useRef(null);

  /* =========================
     CLEANUP ON UNMOUNT
  ========================= */
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  /* =========================
     LOAD COURSE
  ========================= */
  const loadCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const res = await studentAPI.get(`/courses/${courseId}/player`);
      setCourse(res.data.course);
      setUnits(res.data.units || []);
    } catch {
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     AUTH + INITIAL LOAD
  ========================= */
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login", { replace: true });
      return;
    }
    loadCourse();
  }, [courseId]);

  /* =========================
     SYNC URL → STATE
  ========================= */
  useEffect(() => {
    if (unitId) setActiveUnitId(unitId);
    if (lessonId) setActiveLessonId(lessonId);
  }, [unitId, lessonId]);

  /* =========================
     AUTO SELECT FIRST LESSON - CRITICAL FIX
  ========================= */
  useEffect(() => {
    if (hasAutoSelectedRef.current) return;
    if (lessonId) {
      hasAutoSelectedRef.current = true;
      return;
    }
    if (!units.length) return;
    
    const decodedPath = decodeURIComponent(location.pathname);
    const isRootPlayerRoute = decodedPath === `/player/${courseId}`;
    
    if (!isRootPlayerRoute) {
      hasAutoSelectedRef.current = true;
      return;
    }

    const firstUnlockedUnit = units.find(
      (u) => !u.isLocked && u.lessons?.length
    );

    if (!firstUnlockedUnit || !firstUnlockedUnit.lessons.length) return;
    
    hasAutoSelectedRef.current = true;
    navigate(
      `/player/${courseId}/${firstUnlockedUnit._id}/${firstUnlockedUnit.lessons[0]._id}`,
      { replace: true }
    );
  }, [units, lessonId, courseId, navigate, location.pathname]);

  /* =========================
     ACTIVE UNIT / LESSON
  ========================= */
  const activeUnit = useMemo(
    () =>
      units.find((u) => String(u._id) === String(activeUnitId)) || null,
    [units, activeUnitId]
  );

  const activeLesson = useMemo(() => {
    if (!activeUnit || !activeLessonId) return null;
    return activeUnit.lessons.find(
      (l) => String(l._id) === String(activeLessonId)
    );
  }, [activeUnit, activeLessonId]);

  /* =========================
     LOAD TAB DATA
  ========================= */
  useEffect(() => {
    if (!courseId) return;

    if (activeTab === "assignments") {
      studentAPI
        .get(`/courses/${courseId}/assignments`)
        .then((res) => {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.assignments || [];
          setAssignments(list);
        })
        .catch(() => setAssignments([]));
    }

    if (activeTab === "qna") {
      studentAPI
        .get(`/courses/${courseId}/qna`)
        .then((res) => setQna(res.data.questions || []))
        .catch(() => setQna([]));
    }

    if (activeTab === "announcements") {
      studentAPI
        .get(`/courses/${courseId}/announcements`)
        .then((res) =>
          setAnnouncements(res.data.announcements || [])
        )
        .catch(() => setAnnouncements([]));
    }
  }, [activeTab, courseId]);

  /* =========================
     DISPLAY NOTIFICATION HELPER
  ========================= */
  const displayNotification = (message, type = "success") => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotificationMessage(message);
    setNotificationType(type);
    setIsNotificationVisible(true);
    
    notificationTimerRef.current = setTimeout(() => {
      setIsNotificationVisible(false);
      notificationTimerRef.current = null;
    }, 3500);
  };

  /* =========================
     MARK LESSON COMPLETE
  ========================= */
  const markLessonComplete = async () => {
    if (!activeLesson || activeLesson.isCompleted) return;

    try {
      setSaving(true);
      await studentAPI.post(
        `/courses/${courseId}/lessons/${activeLesson._id}/complete`
      );
      
      await loadCourse();
      
      setTimeout(() => {
        navigateToNextLesson();
      }, 500);
      
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
      displayNotification("Failed to mark lesson complete. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     NAVIGATE TO NEXT/PREVIOUS LESSON
  ========================= */
  const navigateToNextLesson = () => {
    if (!activeUnit || !activeLesson) return;

    const currentLessonIndex = activeUnit.lessons.findIndex(
      (l) => String(l._id) === String(activeLessonId)
    );

    if (currentLessonIndex < activeUnit.lessons.length - 1) {
      const nextLesson = activeUnit.lessons[currentLessonIndex + 1];
      displayNotification(`➡️ Moving to: ${nextLesson.title}`);
      navigate(`/player/${courseId}/${activeUnit._id}/${nextLesson._id}`);
      return;
    }

    const currentUnitIndex = units.findIndex(
      (u) => String(u._id) === String(activeUnitId)
    );

    for (let i = currentUnitIndex + 1; i < units.length; i++) {
      const nextUnit = units[i];
      if (!nextUnit.isLocked && nextUnit.lessons?.length > 0) {
        displayNotification(`🎉 Unit completed! Moving to: ${nextUnit.title}`);
        navigate(`/player/${courseId}/${nextUnit._id}/${nextUnit.lessons[0]._id}`);
        return;
      }
    }

    displayNotification("🎉 Congratulations! You've completed all available lessons!", "celebration");
    
    setTimeout(() => {
      navigate(`/student/courses/${courseId}`);
    }, 2500);
  };

  const navigateToPreviousLesson = () => {
    if (!activeUnit || !activeLesson) return;

    const currentLessonIndex = activeUnit.lessons.findIndex(
      (l) => String(l._id) === String(activeLessonId)
    );

    if (currentLessonIndex > 0) {
      const prevLesson = activeUnit.lessons[currentLessonIndex - 1];
      navigate(`/player/${courseId}/${activeUnit._id}/${prevLesson._id}`);
      return;
    }

    const currentUnitIndex = units.findIndex(
      (u) => String(u._id) === String(activeUnitId)
    );

    for (let i = currentUnitIndex - 1; i >= 0; i--) {
      const prevUnit = units[i];
      if (!prevUnit.isLocked && prevUnit.lessons?.length > 0) {
        const lastLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
        navigate(`/player/${courseId}/${prevUnit._id}/${lastLesson._id}`);
        return;
      }
    }
  };

  /* =========================
     COURSE PROGRESS CALCULATION
  ========================= */
  const calculateCourseProgress = useMemo(() => {
    const totalLessons = units.reduce((sum, unit) => sum + (unit.lessons?.length || 0), 0);
    const completedLessons = units.reduce((sum, unit) => {
      return sum + (unit.lessons?.filter(l => l.isCompleted).length || 0);
    }, 0);
    
    return {
      total: totalLessons,
      completed: completedLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
  }, [units]);

  /* =========================
     GET LESSON POSITION
  ========================= */
  const getLessonPosition = useMemo(() => {
    if (!activeUnit || !activeLesson) return { current: 0, total: 0 };
    
    const current = activeUnit.lessons.findIndex(
      (l) => String(l._id) === String(activeLessonId)
    ) + 1;
    
    return {
      current,
      total: activeUnit.lessons.length
    };
  }, [activeUnit, activeLesson, activeLessonId]);

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your course...</p>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <AnimatedBackground>
      <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-white to-gray-50">
        
        {/* ✅ MOBILE: Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* SIDEBAR - Desktop: Always visible, Mobile: Slide-over drawer */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 
          w-72 bg-white border-r border-gray-100 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
          <LessonSidebar
            units={units}
            activeUnit={activeUnit}
            activeLesson={activeLesson}
            finalQuizUnlocked={course?.finalQuizUnlocked}
            finalQuizAvailable={course?.finalQuizAvailable}
            courseProgress={calculateCourseProgress}
            onSelect={(unit, lesson) => {
              setActiveTab("content");
              setIsSidebarOpen(false); // Close drawer on mobile after selection
              navigate(`/player/${courseId}/${unit._id}/${lesson._id}`);
            }}
            onQuizSelect={(unit) =>
              navigate(`/student/courses/${courseId}/units/${unit._id}/quiz`)
            }
            onFinalQuizSelect={() =>
              navigate(`/student/courses/${courseId}/final-quiz`)
            }
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* HEADER - MOBILE OPTIMIZED */}
          <div className="bg-white border-b border-gray-100 px-3 sm:px-4 py-3 shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Back + Menu + Title */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Open course navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Back Button */}
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Back to course overview"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {/* Course Title - Truncated */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-gray-900 truncate">
                    {course?.title || "Course"}
                  </h1>
                  {activeLesson && (
                    <p className="text-xs text-gray-500 truncate">{activeLesson.title}</p>
                  )}
                </div>
              </div>

              {/* Right: Progress Badge - Compact on mobile */}
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                  <div className="text-xs font-bold">{calculateCourseProgress.percentage}%</div>
                  <div className="text-[10px] opacity-90 hidden sm:block">
                    {calculateCourseProgress.completed}/{calculateCourseProgress.total}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Unit Badge - Mobile only, below header */}
            {activeUnit && (
              <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full w-fit lg:hidden">
                <Award className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{activeUnit.title}</span>
              </div>
            )}
          </div>

          {/* TABS - Horizontal Scroll on Mobile */}
          <div className="bg-white border-b border-gray-100 px-3 sm:px-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2 -mx-1 px-1">
              <Tab 
                icon={<BookOpen className="w-4 h-4" />} 
                label="Content" 
                active={activeTab === "content"} 
                onClick={() => setActiveTab("content")} 
                compact
              />
              <Tab 
                icon={<ClipboardList className="w-4 h-4" />} 
                label="Assignments" 
                active={activeTab === "assignments"} 
                onClick={() => setActiveTab("assignments")} 
                badge={assignments.length > 0 ? assignments.length : null}
                compact
              />
              <Tab 
                icon={<MessageCircle className="w-4 h-4" />} 
                label="Q&A" 
                active={activeTab === "qna"} 
                onClick={() => setActiveTab("qna")} 
                compact
              />
              <Tab 
                icon={<Bell className="w-4 h-4" />} 
                label="Announcements" 
                active={activeTab === "announcements"} 
                onClick={() => setActiveTab("announcements")} 
                badge={announcements.length > 0 ? announcements.length : null}
                compact
              />
              <Tab 
                icon={<Lightbulb className="w-4 h-4" />} 
                label="Notes" 
                active={activeTab === "notes"} 
                onClick={() => setActiveTab("notes")} 
                compact
              />
            </div>
          </div>

          {/* CONTENT AREA - Full width, scrollable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {activeTab === "content" && activeLesson ? (
              <div className="max-w-full">
                {/* Lesson Navigation - Full width buttons on mobile */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={navigateToPreviousLesson}
                    disabled={!activeUnit || !activeLesson || String(activeUnit.lessons[0]._id) === String(activeLessonId)}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-gray-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-indigo-50 min-h-[44px] min-w-[44px] flex-1 sm:flex-none sm:min-w-0 justify-center sm:justify-start"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Previous</span>
                  </button>
                  
                  <button
                    onClick={navigateToNextLesson}
                    disabled={!activeUnit || !activeLesson || String(activeUnit.lessons[activeUnit.lessons.length - 1]._id) === String(activeLessonId)}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-gray-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-indigo-50 min-h-[44px] min-w-[44px] flex-1 sm:flex-none sm:min-w-0 justify-center sm:justify-end"
                  >
                    <span className="text-sm font-medium hidden sm:inline">Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Lesson Content Card - Simplified for mobile */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                  {/* Lesson Header - Minimal on mobile */}
                  <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {getLessonPosition.current}/{getLessonPosition.total}
                      </span>
                      {activeLesson.isCompleted && (
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Done
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-gray-900 mt-2 text-base leading-tight">
                      {activeLesson.title}
                    </h2>
                    {activeLesson.description && (
                      <p className="text-gray-600 mt-1 text-sm line-clamp-2">{activeLesson.description}</p>
                    )}
                  </div>
                  
                  {/* Resource Display - Full width, no side margins on mobile */}
                  <div className="p-3 sm:p-4">
                    <ResourceDisplay lesson={activeLesson} isMobile />
                  </div>
                </div>

                {/* Completion Button - Sticky, full-width on mobile */}
                <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 z-20">
                  <button
                    onClick={markLessonComplete}
                    disabled={saving || activeLesson.isCompleted}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-base shadow-sm transition-all min-h-[48px] touch-manipulation ${
                      activeLesson.isCompleted
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : saving
                        ? "bg-gray-200 text-gray-500 cursor-wait"
                        : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white active:scale-[0.99]"
                    }`}
                  >
                    {saving
                      ? "Saving..."
                      : activeLesson.isCompleted
                      ? "✓ Lesson Completed"
                      : "Mark as Complete"}
                  </button>
                </div>
              </div>
            ) : activeTab === "content" && !activeLesson ? (
              <div className="text-center py-12 px-4">
                <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Select a Lesson</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Choose a lesson from the navigation to start learning.
                </p>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors lg:hidden min-h-[44px]"
                >
                  <Menu className="w-4 h-4" />
                  Open Lessons
                </button>
              </div>
            ) : activeTab === "assignments" ? (
              <AssignmentsTab courseId={courseId} assignments={assignments} isMobile />
            ) : activeTab === "qna" ? (
              <QnAPanel courseId={courseId} lesson={activeLesson} questions={qna} isMobile />
            ) : activeTab === "announcements" ? (
              <AnnouncementsPanel courseId={courseId} isMobile />
            ) : activeTab === "notes" ? (
              <NotesPanel courseId={courseId} isMobile />
            ) : null}
          </div>
        </div>

        {/* NOTIFICATION TOAST - Mobile positioned */}
        {isNotificationVisible && (
          <div 
            className={`fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-md w-auto animate-slideUp z-50 ${
              notificationType === "success" 
                ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                : notificationType === "error"
                ? "bg-gradient-to-r from-red-500 to-rose-600"
                : "bg-gradient-to-r from-amber-500 to-orange-600"
            } text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}
          >
            {notificationType === "success" && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            {notificationType === "error" && <Lock className="w-5 h-5 flex-shrink-0" />}
            {notificationType === "celebration" && <Trophy className="w-5 h-5 flex-shrink-0" />}
            <span className="font-medium text-sm line-clamp-2">{notificationMessage}</span>
            <button 
              onClick={() => setIsNotificationVisible(false)}
              className="ml-auto p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AnimatedBackground>
  );
}

/* =========================
   TAB BUTTON - Mobile Optimized
========================= */
function Tab({ icon, label, active, onClick, badge, compact }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap flex-shrink-0 min-h-[40px] ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
          : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
      }`}
    >
      {icon}
      <span className={compact ? 'hidden sm:inline' : ''}>{label}</span>
      {badge && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
          active ? "bg-white/20 text-white" : "bg-red-500 text-white"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}
