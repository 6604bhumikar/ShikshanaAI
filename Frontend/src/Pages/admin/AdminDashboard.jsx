import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import adminAPI from "../../lib/adminApi";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  ClipboardCheck, 
  Settings, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  Loader,
  Sparkles,
  ArrowRight,
  BarChart3,
  Activity,
  Clock,
  Menu,
  X
} from "lucide-react";
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

/* ======================
   CONSTANTS
====================== */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function AdminDashboard({ isMobile = false }) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    pendingCommunities: 0,
    revenue: 0,
    monthlyRevenue: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ======================
     FORMAT CURRENCY
  ====================== */
  const formatRupees = useMemo(() => {
    return (value = 0) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
  }, []);
  console.log("Admin Dashboard Render - Stats:", stats);
  /* ======================
     LOAD DASHBOARD DATA
  ====================== */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await adminAPI.get("/dashboard");
        const { stats: apiStats = {} } = res.data || {};

        setStats({
          totalUsers: apiStats.totalUsers || 0,
          totalCourses: apiStats.totalCourses || 0,
          pendingApprovals: apiStats.pendingApprovals || 0,
          pendingCommunities: apiStats.pendingCommunities || 0,
          revenue: apiStats.revenue || 0,
          monthlyRevenue: apiStats.monthlyRevenue || [],
          recentActivities: apiStats.recentActivities || []
        });
      } catch (error) {
        console.error("Admin dashboard load failed", error);
        setError("Failed to load dashboard data. Please try again.");
        toast.error("Unable to load admin dashboard. Please try again.", {
          position: "top-center",
          autoClose: 4000,
          theme: "colored"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* ======================
     DASHBOARD METRICS
  ====================== */
  const metrics = useMemo(() => [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString('en-IN'),
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />,
      trend: "+12%",
      trendUp: true,
      bg: "from-indigo-500/15 to-indigo-100",
      border: "border-indigo-200"
    },
    {
      title: "Total Courses",
      value: stats.totalCourses.toLocaleString('en-IN'),
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
      trend: "+8%",
      trendUp: true,
      bg: "from-blue-500/15 to-blue-100",
      border: "border-blue-200"
    },
    {
      title: "Pending Courses",
      value: stats.pendingApprovals.toLocaleString('en-IN'),
      icon: <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />,
      trend: stats.pendingApprovals > 0 ? "-5%" : "0%",
      trendUp: stats.pendingApprovals === 0,
      bg: "from-amber-500/15 to-amber-100",
      border: "border-amber-200"
    },
    {
      title: "Pending Communities",
      value: stats.pendingCommunities.toLocaleString('en-IN'),
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />,
      trend: stats.pendingCommunities > 0 ? "-3%" : "0%",
      trendUp: stats.pendingCommunities === 0,
      bg: "from-purple-500/15 to-purple-100",
      border: "border-purple-200"
    },
    {
      title: "Total Revenue",
      value: formatRupees(stats.revenue),
      icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />,
      trend: "+15%",
      trendUp: true,
      bg: "from-emerald-500/15 to-emerald-100",
      border: "border-emerald-200"
    }
  ], [stats, formatRupees]);

  /* ======================
     QUICK ACTIONS
  ====================== */
  const actions = useMemo(() => [
    {
      title: "Course Moderation",
      desc: "Approve or reject teacher courses",
      icon: <CheckCircle2 className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/courses",
      color: "indigo"
    },
    {
      title: "Community Moderation",
      desc: "Approve or reject teacher communities",
      icon: <MessageSquare className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/communities",
      color: "purple"
    },
    {
      title: "User Management",
      desc: "Manage students & teachers",
      icon: <Users className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/users",
      color: "green"
    },
    {
      title: "Payouts & Finance",
      desc: "View payments & teacher payouts",
      icon: <DollarSign className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/payouts",
      color: "amber"
    }
  ], []);

  /* ======================
     REVENUE CHART DATA - FIXED
  ====================== */
  const chartData = useMemo(() => {
    if (!stats.monthlyRevenue || stats.monthlyRevenue.length === 0) return [];
    
    const currentMonth = new Date().getMonth();
    return stats.monthlyRevenue.slice(0, 6).map((revenue, index) => {
      const monthIndex = (currentMonth - (5 - index) + 12) % 12;
      return {
        month: MONTHS[monthIndex],
        revenue: revenue || 0,
        formatted: formatRupees(revenue || 0)
      };
    });
  }, [stats.monthlyRevenue, formatRupees]);

  /* ======================
     CUSTOM TOOLTIP FOR CHART
  ====================== */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.[0]) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[140px]">
          <p className="text-xs sm:text-sm font-medium text-gray-800 mb-1">{label}</p>
          <p className="text-sm sm:text-base font-bold text-indigo-600">
            {payload[0].value ? formatRupees(payload[0].value) : '₹0'}
          </p>
        </div>
      );
    }
    return null;
  };

  /* ======================
     SKELETON LOADER - Mobile Optimized
  ====================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 w-full max-w-6xl animate-pulse">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-1/3 mb-6 sm:mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
            ))}
          </div>
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/4 mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 sm:h-40 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-rose-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Dashboard Unavailable</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-6 sm:px-8 py-3 rounded-xl font-medium shadow-lg min-h-[48px] touch-manipulation flex items-center justify-center gap-2"
          >
            <Loader className="w-4 h-4 animate-spin" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
      {/* Animated Background Elements - Mobile Optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={prefersReducedMotion ? {} : { 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 20,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 sm:-top-48 -left-32 sm:-left-48 w-[40rem] sm:w-[80rem] h-[40rem] sm:h-[80rem] bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full blur-2xl sm:blur-3xl transform-gpu"
        />
        <motion.div 
          animate={prefersReducedMotion ? {} : { 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 22,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut",
            delay: prefersReducedMotion ? 0 : 2
          }}
          className="absolute -bottom-32 sm:-bottom-48 -right-32 sm:-right-48 w-[35rem] sm:w-[70rem] h-[35rem] sm:h-[70rem] bg-gradient-to-r from-amber-300 to-pink-300 rounded-full blur-2xl sm:blur-3xl transform-gpu"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.3 : 0.6 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        {/* Header Section - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 md:mb-10 gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-indigo-100 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex-shrink-0">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800 leading-tight truncate">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-0.5 sm:mt-1 text-sm sm:text-base md:text-lg truncate">
                  Platform overview & moderation center
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0" />
                <span className="truncate">Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                <span>Operational</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/admin/settings")}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium shadow-sm border border-gray-200 transition-colors min-h-[44px] touch-manipulation whitespace-nowrap"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Platform Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>

        {/* Metrics Grid - Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide mb-6 sm:mb-8 md:mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 min-w-max sm:min-w-0">
            {metrics.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -5 }}
                className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 bg-white/70 backdrop-blur-sm border ${item.border} shadow-md hover:shadow-lg transition-all min-w-[160px] sm:min-w-0 touch-manipulation`}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{item.title}</p>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{item.value}</h3>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${item.bg} flex-shrink-0 ml-3`}>
                    {item.icon}
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium ${
                  item.trendUp ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {item.trendUp ? (
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  )}
                  <span className="truncate">{item.trend} this month</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Revenue Chart - FIXED WITH RECHARTS */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                  <span className="truncate">Revenue Analytics</span>
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  <span className="hidden sm:inline">Last 6 months</span>
                  <span className="sm:hidden">6 months</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {chartData.length > 0 ? (
                  <>
                    {/* Chart - Using Recharts for reliability */}
                    <div className="h-48 sm:h-56 md:h-64 mb-4 sm:mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid 
                            strokeDasharray="4 4" 
                            vertical={false} 
                            stroke="#f1f5f9" 
                            strokeOpacity={0.5}
                          />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 12 }}
                            dy={6}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 12 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                            width={isMobile ? 35 : 50}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="revenue" 
                            radius={[6, 6, 0, 0]}
                            animationDuration={prefersReducedMotion ? 0 : 500}
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#colorGradient-${index})`}
                              />
                            ))}
                            <defs>
                              {chartData.map((_, index) => (
                                <linearGradient 
                                  key={index} 
                                  id={`colorGradient-${index}`} 
                                  x1="0" 
                                  y1="0" 
                                  x2="0" 
                                  y2="1"
                                >
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                                </linearGradient>
                              ))}
                            </defs>
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Stats Summary - Mobile Optimized */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                      <div className="p-2.5 sm:p-3 bg-indigo-50 rounded-lg sm:rounded-xl text-center">
                        <p className="text-[10px] sm:text-xs text-indigo-700 font-medium mb-1">Avg. Monthly</p>
                        <p className="text-sm sm:text-lg md:text-xl font-bold text-indigo-900 truncate">
                          {formatRupees(stats.monthlyRevenue.reduce((a, b) => a + b, 0) / (stats.monthlyRevenue.length || 1))}
                        </p>
                      </div>
                      <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-lg sm:rounded-xl text-center">
                        <p className="text-[10px] sm:text-xs text-emerald-700 font-medium mb-1">Growth</p>
                        <p className="text-sm sm:text-lg md:text-xl font-bold text-emerald-900">+15%</p>
                      </div>
                      <div className="p-2.5 sm:p-3 bg-amber-50 rounded-lg sm:rounded-xl text-center">
                        <p className="text-[10px] sm:text-xs text-amber-700 font-medium mb-1">Peak</p>
                        <p className="text-sm sm:text-lg md:text-xl font-bold text-amber-900 truncate">Jul 2024</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-gray-400">
                    <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mb-3 opacity-20" />
                    <p className="text-sm sm:text-base font-medium text-center px-4">No revenue data available</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center px-4">Data will appear once transactions are recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Activities - Mobile Optimized */}
          <div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  <span className="truncate">Recent Activities</span>
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-64 sm:max-h-72 md:max-h-96 overflow-y-auto custom-scrollbar">
                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.slice(0, 8).map((activity, index) => (
                    <div key={index} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors min-h-[60px] touch-manipulation">
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          activity.type === 'course' ? 'bg-indigo-100' :
                          activity.type === 'community' ? 'bg-purple-100' :
                          activity.type === 'user' ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          {activity.type === 'course' && <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />}
                          {activity.type === 'community' && <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />}
                          {activity.type === 'user' && <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />}
                          {activity.type === 'payment' && <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">{activity.description}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">
                    <Activity className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-20" />
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section - Mobile Grid */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-2.5 bg-indigo-100 rounded-xl flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-700" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.3 + index * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -5 }}
                onClick={() => navigate(action.path)}
                className={`cursor-pointer rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all min-h-[140px] touch-manipulation ${
                  action.color === 'indigo' && 'hover:border-indigo-200'
                } ${
                  action.color === 'purple' && 'hover:border-purple-200'
                } ${
                  action.color === 'green' && 'hover:border-green-200'
                } ${
                  action.color === 'amber' && 'hover:border-amber-200'
                }`}
              >
                <div className={`p-2.5 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4 flex items-center justify-center flex-shrink-0 ${
                  action.color === 'indigo' && 'bg-indigo-50'
                } ${
                  action.color === 'purple' && 'bg-purple-50'
                } ${
                  action.color === 'green' && 'bg-green-50'
                } ${
                  action.color === 'amber' && 'bg-amber-50'
                }`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base md:text-lg line-clamp-1">{action.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{action.desc}</p>
                <div className="flex items-center text-xs sm:text-sm font-medium text-indigo-600">
                  <span className="truncate">Go to {action.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Status - Mobile Optimized */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border border-indigo-100 p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-indigo-100 rounded-xl mt-0.5 sm:mt-1 flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">System Status</h3>
                <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                  All services operational. Platform health: 99.98% uptime
                </p>
              </div>
            </div>
            <button
              className="border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap min-h-[40px] touch-manipulation"
              onClick={() => navigate('/admin/settings')}
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
