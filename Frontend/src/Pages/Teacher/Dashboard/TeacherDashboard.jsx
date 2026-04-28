import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  BookOpen,
  PlusCircle,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Video,
  Percent,
  Activity,
  BarChart2,
  Users,
  Menu,
  X
} from "lucide-react";

import DashboardChart from "./DashboardChart";
import DashboardStats from "./DashboardStats";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const accessToken = localStorage.getItem("accessToken");

  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    completions: 0,
    rating: 0,
    communities: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ MOBILE: Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */
  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = res?.data || {};
      const summary = data.summary || {};

      setStats({
        courses: summary.coursesCreated || 0,
        students: summary.activeStudents || 0,
        completions: summary.courseCompletions || 0,
        rating: summary.avgRating || 0,
        communities: summary.communitiesCreated || 0,
      });

      setChartData(Array.isArray(data.chartData) ? data.chartData : []);
      setRecentCourses(Array.isArray(data.recentCourses) ? data.recentCourses : []);
    } catch (err) {
      console.error("DASHBOARD LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const goTo = (path) => {
    setIsSidebarOpen(false); // ✅ Close mobile sidebar on navigation
    if (location.pathname !== path) navigate(path);
  };

  /* =========================
     SIDEBAR CONFIG
  ========================= */
  const sidebarLinks = [
    { title: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/teacher/dashboard" },
    { title: "Create Course", icon: <PlusCircle className="w-5 h-5" />, path: "/teacher/create-course" },
    { title: "My Courses", icon: <BookOpen className="w-5 h-5" />, path: "/teacher/my-courses" },
    { title: "Communities", icon: <Users className="w-5 h-5" />, path: "/teacher/communities" },
    { title: "Announcements", icon: <MessageSquare className="w-5 h-5" />, path: "/teacher/announcements" },
    { title: "Q&A", icon: <MessageCircle className="w-5 h-5" />, path: "/teacher/qna" },
    { title: "Recorder", icon: <Video className="w-5 h-5" />, path: "/teacher/recorder" },
    { title: "Coupons", icon: <Percent className="w-5 h-5" />, path: "/teacher/coupons" },
  ];

  const isDashboardHome = location.pathname === "/teacher/dashboard";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* ✅ MOBILE: Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* =====================
          SIDEBAR - Desktop: Fixed, Mobile: Slide-over
      ====================== */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200 shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo + Mobile Close Button */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-100">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Shikshana
          </h1>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {sidebarLinks.map((item, idx) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={idx}
                onClick={() => goTo(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[48px] touch-manipulation ${
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.title}
              </button>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || "T"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "Teacher"}</p>
              <p className="text-xs text-slate-500 truncate">Instructor</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[48px] touch-manipulation"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* =====================
          MAIN CONTENT AREA
      ====================== */}
      <main className={`flex-1 flex flex-col min-w-0 ${!isDashboardHome ? "h-full overflow-hidden" : "overflow-hidden"}`}>
        
        {/* HEADER - Mobile Optimized */}
        <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shrink-0">
          {/* Left: Menu Toggle + Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* ✅ MOBILE: Hamburger Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-slate-800 truncate">
                {isDashboardHome ? "Dashboard Overview" : ""}
              </h2>
            </div>
          </div>
          
          {/* Right: Create Course Button (Desktop only, simplified on mobile) */}
          {isDashboardHome && (
            <button
              onClick={() => goTo("/teacher/create-course")}
              className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <PlusCircle size={18} /> Create Course
            </button>
          )}
          
          {/* Mobile: Floating Action Button for Create Course */}
          {isDashboardHome && (
            <button
              onClick={() => goTo("/teacher/create-course")}
              className="sm:hidden p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Create Course"
            >
              <PlusCircle size={20} />
            </button>
          )}
        </header>

        {/* SCROLLABLE CONTENT WRAPPER */}
        <div className={`flex-1 overflow-y-auto ${isDashboardHome ? "bg-slate-50/50 p-4 sm:p-6 lg:p-8" : "p-0"}`}>
          
          {/* =====================
              VIEW: DASHBOARD HOME
          ====================== */}
          {isDashboardHome && (
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              
              {/* Stats Row - Horizontal Scroll on Mobile */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <DashboardStats stats={stats} isMobile />
              </div>

              {/* Split View: Chart (Left) + Recent (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 flex-1 min-h-0">
                
                {/* Left Column: Chart */}
                <div className="lg:col-span-2">
                  <DashboardChart chartData={chartData} isMobile />
                </div>

                {/* Right Column: Recent Courses - Scrollable */}
                <div className="lg:col-span-1 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex flex-col h-64 sm:h-80 lg:h-auto overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Recent Courses</h3>
                    <button onClick={() => goTo("/teacher/my-courses")} className="text-xs text-indigo-600 hover:underline">View All</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {recentCourses.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-4 text-center">
                        <Activity className="w-8 h-8 mb-2 opacity-20" />
                        <p>No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentCourses.map((course) => (
                          <div
                            key={course._id}
                            className="group p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer min-h-[56px] touch-manipulation"
                            onClick={() => navigate(`/teacher/courses/${course._id}`)}
                          >
                            <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {course.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400">
                                {course.updatedAgo || "Recently updated"}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/teacher/courses/${course._id}/analytics`);
                                }}
                                className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Analytics"
                                aria-label="View analytics"
                              >
                                <BarChart2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =====================
              VIEW: OUTLET (Nested Routes)
          ====================== */}
          {!isDashboardHome && (
            <div className="h-full w-full">
              <Outlet />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
