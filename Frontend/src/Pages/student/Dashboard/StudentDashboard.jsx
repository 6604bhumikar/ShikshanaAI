import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Award,
  Clock,
  Receipt,
  FileCheck,
  GraduationCap,
  Trophy,
  AlertCircle,
  Loader,
  Package,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { studentAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import CourseProgressCard from "./CourseProgressCard";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    hours: 0,
  });
  const [courses, setCourses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* =========================
     🔐 AUTH + DATA FETCH
  ========================= */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        const res = await studentAPI.get("/dashboard", { signal });
        
        if (!isMounted) return;
        
        setStats(res.data.stats || { enrolled: 0, completed: 0, hours: 0 });
        setCourses(res.data.enrolledCourses || []);
        setOrders(res.data.recentOrders || []);
        setCertificates(res.data.certificates || []);
      } catch (err) {
        if (!isMounted || signal.aborted) return;

        if (err?.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login", { replace: true });
          return;
        }

        if (!err?.response) {
          setError("Network error. Please check your connection.");
        } else {
          setError(err.response.data?.message || "Failed to load dashboard.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [navigate, retryCount]);

  const inProgress = courses.filter((c) => !c.completed);
  const completed = courses.filter((c) => c.completed);
  const completionRate = stats.enrolled > 0 
    ? Math.round((stats.completed / stats.enrolled) * 100) 
    : 0;

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError("");
  };

  /* =========================
     RENDER
  ========================= */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16 text-rose-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Dashboard Unavailable</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm min-h-[44px]"
            >
              <Loader className="w-4 h-4 animate-spin" />
              Retry Loading
            </button>
            <button
              onClick={() => navigate("/catalog")}
              className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm min-h-[44px]"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      
      {/* Header Section - MOBILE OPTIMIZED */}
      <div className="border-b border-gray-200/50 bg-white/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Welcome */}
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-xl flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Welcome Back!</h1>
                <p className="text-xs sm:text-sm text-gray-600">Continue your learning journey</p>
              </div>
            </div>

            {/* Right: Quick Actions - Hidden on mobile, shown in menu instead */}
            <div className="flex gap-2">
              <QuickAction
                icon={<Receipt className="w-4 h-4" />}
                label="Orders"
                onClick={() => navigate("/student/orders")}
                gradient="from-indigo-600 to-purple-700"
                compact={isMobile}
              />
              <QuickAction
                icon={<FileCheck className="w-4 h-4" />}
                label="Certificates"
                onClick={() => navigate("/student/certificates")}
                gradient="from-emerald-600 to-teal-700"
                compact={isMobile}
              />
            </div>
          </div>

          {/* Stats Row - HORIZONTALLY SCROLLABLE ON MOBILE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
          >
            <StatCard 
              icon={<BookOpen className="w-4 h-4" />} 
              label="Enrolled" 
              value={stats.enrolled} 
              accentColor="from-indigo-500 to-purple-600"
              compact={isMobile}
            />
            <StatCard 
              icon={<Award className="w-4 h-4" />} 
              label="Completed" 
              value={stats.completed} 
              accentColor="from-emerald-500 to-teal-600"
              compact={isMobile}
            />
            <StatCard 
              icon={<Clock className="w-4 h-4" />} 
              label="Hours" 
              value={stats.hours} 
              accentColor="from-amber-500 to-orange-600"
              compact={isMobile}
            />
            <StatCard 
              icon={<Trophy className="w-4 h-4" />} 
              label="Rate" 
              value={`${completionRate}%`} 
              accentColor="from-rose-500 to-pink-600"
              compact={isMobile}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content - RESPONSIVE LAYOUT */}
      {loading ? (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/50 rounded-2xl animate-pulse h-48 sm:h-64"></div>
          ))}
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          {/* MOBILE: Single column stacked layout */}
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'} max-w-7xl mx-auto`}>
            
            {/* Column 1: In Progress */}
            <ScrollableColumn 
              title="In Progress" 
              icon={<BookOpen className="w-5 h-5 text-indigo-600" />}
              isEmpty={inProgress.length === 0}
              emptyContent={
                <EmptyState 
                  icon={<BookOpen className="w-10 h-10 text-gray-400" />} 
                  title="All Clear!" 
                  message="Start a new course."
                  actionLabel="Browse"
                  onAction={() => navigate("/catalog")}
                  compact
                />
              }
              isMobile={isMobile}
            >
              {inProgress.map((course) => 
                isMobile ? (
                  <MobileCourseListItem
                    key={course._id}
                    course={course}
                    onContinue={() => navigate(`/player/${course._id}`)}
                  />
                ) : (
                  <CourseProgressCard
                    key={course._id}
                    course={course}
                    onContinue={() => navigate(`/player/${course._id}`)}
                  />
                )
              )}
            </ScrollableColumn>

            {/* Column 2: Completed */}
            <ScrollableColumn 
              title="Completed" 
              icon={<Award className="w-5 h-5 text-emerald-600" />}
              isEmpty={completed.length === 0}
              emptyContent={
                <EmptyState 
                  icon={<Award className="w-10 h-10 text-gray-400" />} 
                  title="None Yet" 
                  message="Finish a course to see it here."
                  compact
                />
              }
              isMobile={isMobile}
            >
              {completed.map((course) => 
                isMobile ? (
                  <MobileCourseListItem
                    key={course._id}
                    course={course}
                    onContinue={() => navigate(`/student/courses/${course._id}`)}
                    showCompletedBadge
                  />
                ) : (
                  <CourseProgressCard
                    key={course._id}
                    course={course}
                    onContinue={() => navigate(`/student/courses/${course._id}`)}
                  />
                )
              )}
            </ScrollableColumn>

            {/* Column 3: Orders & Certificates - Stacked on mobile */}
            <div className={`${isMobile ? 'space-y-4' : 'h-full flex flex-col gap-6'}`}>
              {/* Orders Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-gray-900 text-base">Recent Orders</h3>
                  </div>
                  {orders.length > 0 && (
                    <button onClick={() => navigate("/student/orders")} className="text-xs text-indigo-600 font-medium hover:underline">
                      View All
                    </button>
                  )}
                </div>
                <div className={`overflow-y-auto ${isMobile ? 'max-h-48' : 'flex-1'} p-2`}>
                  {orders.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-4">
                       <p className="text-gray-400 text-sm">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.slice(0, 5).map(order => (
                        <OrderSummaryCard key={order._id} order={order} onView={() => navigate("/student/orders")} compact={isMobile} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Certificates Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-rose-600" />
                    <h3 className="font-bold text-gray-900 text-base">Certificates</h3>
                  </div>
                   {certificates.length > 0 && (
                    <button onClick={() => navigate("/student/certificates")} className="text-xs text-indigo-600 font-medium hover:underline">
                      View All
                    </button>
                  )}
                </div>
                <div className={`overflow-y-auto ${isMobile ? 'max-h-48' : 'flex-1'} p-2`}>
                   {certificates.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-4">
                       <p className="text-gray-400 text-sm">No certificates earned</p>
                    </div>
                  ) : (
                     <div className="space-y-2">
                      {certificates.slice(0, 5).map(cert => (
                        <CertificateCard key={cert._id} certificate={cert} onView={() => navigate(`/student/certificates`)} compact={isMobile} />
                      ))}
                     </div>
                   )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   UI COMPONENTS - MOBILE OPTIMIZED
========================= */

function StatCard({ icon, label, value, accentColor, compact }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all flex-shrink-0 ${compact ? 'p-2.5 min-w-[100px]' : 'p-3 min-w-[120px]'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${accentColor} text-white flex-shrink-0`}>
        {React.cloneElement(icon, { className: compact ? "w-4 h-4" : "w-5 h-5" })}
      </div>
      <div className="min-w-0">
        <p className={`text-gray-500 truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>{label}</p>
        <p className={`font-bold bg-clip-text text-transparent bg-gradient-to-r ${accentColor} ${compact ? 'text-base' : 'text-lg'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick, gradient, compact }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl font-medium text-white shadow-sm flex items-center gap-1.5 transition-all bg-gradient-to-r ${gradient} hover:shadow-md flex-shrink-0 ${compact ? 'px-3 py-2 text-xs min-h-[36px]' : 'px-4 py-2 text-sm min-h-[40px]'}`}
    >
      {icon}
      <span className={compact ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  );
}

// Updated Component: Scrollable Column Wrapper - MOBILE AWARE
function ScrollableColumn({ title, icon, children, isEmpty, emptyContent, isMobile }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg">
            {icon}
          </div>
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">{title}</h3>
        </div>
      </div>
      
      <div className={`overflow-y-auto ${isMobile ? 'max-h-80' : 'flex-1'} p-2 custom-scrollbar`}>
        {isEmpty ? (
          <div className={`${isMobile ? 'py-6' : 'h-full'} flex items-center justify-center`}>
            {emptyContent}
          </div>
        ) : (
          <div className={`space-y-${isMobile ? '2' : '3'}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, message, actionLabel, onAction, compact }) {
  return (
    <div className={`text-center ${compact ? 'py-4 px-2' : 'p-6'}`}>
      <div className="inline-block p-2 bg-gray-50 rounded-xl mb-2">
        {React.cloneElement(icon, { className: `${compact ? 'w-8 h-8' : 'w-10 h-10'} text-gray-300` })}
      </div>
      <h3 className={`font-bold text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
      <p className={`text-gray-500 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mx-auto"
        >
          <Sparkles className="w-3 h-3" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ✅ NEW: Simplified Mobile Course List Item (No Image)
function MobileCourseListItem({ course, onContinue, showCompletedBadge }) {
  const progress = course.progress || 0;
  
  return (
    <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight">
              {course.title}
            </h4>
            {showCompletedBadge && (
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium flex-shrink-0">
                Done
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
            {course.instructor && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {course.instructor}
              </span>
            )}
            {course.lastAccessed && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(course.lastAccessed).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        
        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all min-w-[70px] min-h-[36px]"
        >
          {showCompletedBadge ? 'View' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

function OrderSummaryCard({ order, onView, compact }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer ${compact ? '' : 'flex items-center justify-between'}`} onClick={onView}>
      <div className={compact ? '' : 'flex-1 min-w-0'}>
        <h4 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-base'} truncate`}>
          {order.courseTitle || "Course"}
        </h4>
        <p className={`text-gray-500 ${compact ? 'text-[10px]' : 'text-xs'} mt-0.5`}>
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : ""}
        </p>
      </div>
      <div className={`flex items-center gap-2 ${compact ? 'mt-2' : ''}`}>
        <span className={`font-bold text-indigo-600 ${compact ? 'text-xs' : 'text-sm'}`}>
          ₹{Number(order.amount || 0).toLocaleString('en-IN')}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
          order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {order.status || 'N/A'}
        </span>
        <ChevronRight className={`w-4 h-4 text-gray-400 ${compact ? '' : 'ml-1'}`} />
      </div>
    </div>
  );
}

function CertificateCard({ certificate, onView, compact }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer ${compact ? '' : 'flex items-center justify-between'}`} onClick={onView}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 rounded-lg flex-shrink-0">
          <Trophy className={`w-4 h-4 text-rose-600 ${compact ? '' : 'sm:w-5 sm:h-5'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-base'} truncate`}>
            {certificate.courseTitle || "Certificate"}
          </h4>
          <p className={`text-gray-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            Issued {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ""}
          </p>
        </div>
      </div>
      {!compact && <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />}
    </div>
  );
}
