import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  GraduationCap, 
  Star, 
  User, 
  Clock, 
  Award, 
  AlertCircle,
  Loader,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

// Helper Icon Components
const CodeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

const BrainIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const BarChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const CloudIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.758 3.755 3.755 0 00-7.257 1.332 3 3 0 00-3.758 3.758 3.754 3.754 0 001.332 7.257z" />
  </svg>
);

const BriefcaseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.098-.42.184-.665.253m-4.5-.253a48.04 48.04 0 01-3.413.387m7.5 8.006V16.67a2.18 2.18 0 00-.75-1.661m0 0V8.706c0-1.081.768-2.015 1.837-2.175a48.114 48.114 0 013.413-.387m7.5 8.006c.194.098.42.184.665.253m7.5-.253a48.04 48.04 0 003.413.387m0 0c1.085.144 1.872 1.086 1.872 2.18v4.25m-16.5 0a2.18 2.18 0 00.75 1.661V16.67m0 0v-1.5m0 1.5a2.18 2.18 0 00-.75-1.661m0 0V8.706c0-1.081.768-2.015 1.837-2.175a48.114 48.114 0 013.413-.387m7.5 8.006V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m7.5 8.006c-1.085.144-1.872 1.086-1.872 2.18v4.25m-16.5 0a2.18 2.18 0 01-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.114 48.114 0 013.413-.387" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

/* 🔒 FIXED CATEGORY LIST WITH ICONS */
const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories", icon: <Filter className="w-4 h-4" /> },
  { value: "programming", label: "Programming & Development", icon: <CodeIcon className="w-4 h-4" /> },
  { value: "ai", label: "AI & Machine Learning", icon: <BrainIcon className="w-4 h-4" /> },
  { value: "data", label: "Data Science", icon: <BarChartIcon className="w-4 h-4" /> },
  { value: "security", label: "Cybersecurity", icon: <ShieldIcon className="w-4 h-4" /> },
  { value: "cloud", label: "Cloud Computing", icon: <CloudIcon className="w-4 h-4" /> },
  { value: "business", label: "Business", icon: <BriefcaseIcon className="w-4 h-4" /> },
];

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_PUBLIC = import.meta.env.VITE_API_PUBLIC || "http://localhost:5000/api/public";

  /* ===================== LOAD COURSES ===================== */
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API_PUBLIC}/courses`);
      
      const courseList = Array.isArray(res.data)
        ? res.data
        : res.data?.courses || [];
        
      setCourses(courseList);
    } catch (err) {
      console.error("Failed to load catalog courses:", err);
      setError("Failed to load courses. Please try again later.");
      toast.error("Unable to load courses. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== FILTER COURSES ===================== */
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) || 
        course.description?.toLowerCase().includes(search.toLowerCase());

      const courseCategory = course.category || course.categories?.[0] || "";
      const matchesCategory = 
        category === "all" || 
        !courseCategory ||
        courseCategory.toLowerCase().includes(category.toLowerCase()) ||
        (Array.isArray(course.categories) && 
         course.categories.some(c => c.toLowerCase().includes(category.toLowerCase())));

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  /* ===================== CLEAR FILTERS ===================== */
  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    toast.info("Filters cleared", {
      position: "top-center",
      autoClose: 2000,
      theme: "colored"
    });
  };

  /* ===================== SKELETON LOADER ===================== */
  const CourseSkeleton = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 overflow-hidden shadow-sm animate-pulse min-h-0"
    >
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements - MOBILE OPTIMIZED */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 sm:-top-48 -left-32 sm:-left-48 w-[40rem] sm:w-[80rem] h-[40rem] sm:h-[80rem] bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full blur-2xl sm:blur-3xl transform-gpu"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-32 sm:-bottom-48 -right-32 sm:-right-48 w-[35rem] sm:w-[70rem] h-[35rem] sm:h-[70rem] bg-gradient-to-r from-amber-300 to-pink-300 rounded-full blur-2xl sm:blur-3xl transform-gpu"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16 px-1"
        >
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800 mb-3 sm:mb-4 leading-tight">
            Discover Your Next Learning Adventure
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Explore our curated collection of high-quality courses designed to help you achieve your professional and personal goals.
          </p>
          
          {/* Quick Stats - Mobile Optimized */}
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-8 px-2">
            {[
              { value: "2,000+", label: "Courses" },
              { value: "50K+", label: "Students" },
              { value: "4.8/5", label: "Avg Rating" },
              { value: "100+", label: "Expert Instructors" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center min-w-[70px] sm:min-w-[90px]"
              >
                <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filter Section - MOBILE OPTIMIZED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 mb-8 sm:mb-12"
        >
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white/90 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base min-h-[44px] touch-manipulation"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:min-w-[200px]">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none w-full bg-white/90 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              {(search || category !== "all") && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 min-h-[44px] px-4 sm:px-6"
                >
                  <Filter className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Filter Tags - Scrollable on mobile */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 overflow-x-auto pb-2 -mx-2 px-2">
            {[
              { icon: Star, color: "text-amber-400", label: "Top Rated" },
              { icon: Clock, color: "text-indigo-500", label: "Self-Paced" },
              { icon: Award, color: "text-emerald-500", label: "Certificates" },
              { icon: User, color: "text-purple-500", label: "Expert Instructors" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center whitespace-nowrap flex-shrink-0">
                <item.icon className={`w-4 h-4 ${item.color} mr-1`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 sm:mb-8 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center gap-3 max-w-3xl mx-auto"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">{error}</p>
                <button
                  onClick={loadCourses}
                  className="mt-2 text-xs sm:text-sm text-rose-800 hover:text-rose-900 font-medium flex items-center gap-1"
                >
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Retry Loading
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course Grid - FIXED LAYOUT */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <CourseSkeleton key={i} />
              ))}
            </motion.div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center py-12 sm:py-16 px-4"
            >
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No Courses Found</h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6 sm:mb-8 px-2">
                {search || category !== "all" 
                  ? "Try adjusting your filters or search terms to find what you're looking for."
                  : "We're constantly adding new courses. Check back soon for exciting new content!"}
              </p>
              {(search || category !== "all") && (
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-6 sm:px-8 py-3 rounded-xl font-medium shadow-lg min-h-[44px] w-full sm:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters & Browse All
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredCourses.map((course, index) => {
                const isFree = course.isFree === true || course.price === 0;
                const price = isFree ? "Free" : `₹${Number(course.price || 0).toLocaleString('en-IN')}`;
                const rating = course.avgRating || course.rating || 4.5;
                const students = course.students || course.enrolledStudents || 0;
                const formattedStudents = students >= 1000 
                  ? `${(students / 1000).toFixed(1)}K` 
                  : students.toString();

                return (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col min-h-0 transform-gpu"
                  >
                    {/* Course Thumbnail - FIXED ASPECT RATIO */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <img
                        src={course.thumbnail || `/course-placeholder-${index % 5}.jpg`}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/600x400/indigo-50/indigo-600?text=Course+Preview";
                        }}
                        loading="lazy"
                      />
                      {isFree && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          FREE
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    </div>

                    {/* Course Content - FLEX LAYOUT FIXED */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 min-h-0">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <h2 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2 min-h-[40px] sm:min-h-[48px] leading-tight">
                          {course.title}
                        </h2>
                        <div className="flex items-center text-amber-400 flex-shrink-0 ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < Math.floor(rating) 
                                  ? "fill-current" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-1 leading-relaxed">
                        {course.description || "Comprehensive course covering essential concepts and practical applications."}
                      </p>
                      
                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{course.teacher?.name || course.teacherName || "Expert Instructor"}</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-amber-500 flex-shrink-0" />
                          <span>{formattedStudents} students</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1 min-w-0">
                          <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700 whitespace-nowrap">
                            {price}
                          </span>
                          {!isFree && (
                            <span className="text-[10px] sm:text-xs text-gray-500 line-through hidden sm:inline">
                              ₹{Number(course.originalPrice || course.price * 1.5).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => navigate(`/course/${course._id}`)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-3 sm:px-4 py-2 rounded-xl font-medium shadow transition-all flex items-center gap-1 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] flex-shrink-0"
                        >
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTA - FIXED OVERFLOW & MOBILE RESPONSIVE */}
        {filteredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 sm:mt-16 max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white relative overflow-hidden"
          >
            {/* Decorative Elements - CONTAINED & MOBILE OPTIMIZED */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full -translate-x-1/4 -translate-y-1/4 blur-2xl" />
              <div className="absolute bottom-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-white rounded-full translate-x-1/4 translate-y-1/4 blur-2xl" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                Ready to Transform Your Career?
              </h2>
              <p className="text-sm sm:text-lg opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Join thousands of students who have achieved their goals with Shikshana. 
                Start learning today and unlock your potential!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-700 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg min-h-[48px] w-full sm:w-auto"
                  onClick={() => navigate('/register')}
                >
                  Create Free Account
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-gray-700 hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold min-h-[48px] w-full sm:w-auto"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
