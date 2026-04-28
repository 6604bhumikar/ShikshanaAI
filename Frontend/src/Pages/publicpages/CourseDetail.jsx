import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Award, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  User, 
  PlayCircle, 
  CheckCircle, 
  AlertCircle,
  Loader,
  MessageCircle,
  ShieldCheck,
  Heart
} from "lucide-react";
import { toast } from 'react-toastify';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const [course, setCourse] = useState(null);
  const [meta, setMeta] = useState({});
  const [access, setAccess] = useState({});
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [openUnit, setOpenUnit] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  const API_PUBLIC = import.meta.env.VITE_API_PUBLIC || "http://localhost:5000/api/public";
  const API_STUDENT = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";

  /* ================= SCROLL TO TOP ON MOUNT ================= */
  useEffect(() => {
    // Scroll to top smoothly when component mounts or course id changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fallback for browsers that don't support smooth scroll
    const timer = setTimeout(() => {
      if (window.scrollY > 100) {
        window.scrollTo(0, 0);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchReviews();
    }
  }, [id]);

  /* ================= FETCH COURSE ================= */
  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_PUBLIC}/courses/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setCourse(res.data.course || null);
      setMeta(res.data.meta || {});
      setAccess(res.data.access || {});
    } catch (err) {
      console.error("Course fetch error:", err);
      toast.error("Course not found. Redirecting to catalog...", {
        autoClose: 3000,
        position: "top-center",
        theme: "colored"
      });
      setTimeout(() => navigate("/catalog"), 3500);
    }
  };

  /* ================= FETCH REVIEWS ================= */
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_PUBLIC}/courses/${id}/reviews`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (err) {
      console.error("Reviews fetch error:", err);
      setReviews([]);
      setAvgRating(0);
      setTotalReviews(0);
    }
  };

  /* ================= ENROLLMENT HANDLER ================= */
  const handleEnroll = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.info("Please login to enroll in this course", {
        autoClose: 3000,
        position: "top-center",
        theme: "colored"
      });
      navigate("/login", { state: { from: `/course/${id}` } });
      return;
    }

    if (access.enrolled) {
      navigate(`/player/${id}`);
      return;
    }

    try {
      setEnrolling(true);
      
      if (access.isFree) {
        await axios.post(
          `${API_STUDENT}/payments/create-order`,
          { courseId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAccess((prev) => ({ ...prev, enrolled: true }));
        toast.success("Enrolled successfully! Redirecting to course...", {
          autoClose: 3000,
          position: "top-center",
          theme: "colored"
        });
        navigate(`/player/${id}`);
      } else {
        navigate(`/checkout/${id}`);
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      const errorMsg = err.response?.data?.message || "Failed to enroll. Please try again.";
      toast.error(errorMsg, {
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
      if (access.isFree) {
        setAccess(prev => ({ ...prev, enrolled: false }));
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.info("Please login to save this course", {
        autoClose: 3000,
        position: "top-center",
        theme: "colored"
      });
      navigate("/login", { state: { from: `/course/${id}` } });
      return;
    }

    try {
      setSavingWishlist(true);
      await axios.post(
        `${API_STUDENT}/wishlist`,
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Saved to wishlist", {
        autoClose: 2500,
        position: "top-center",
        theme: "colored"
      });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save wishlist item";
      toast.error(message, {
        autoClose: 3500,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setSavingWishlist(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  const priceLabel = access.isFree ? "Free" : `₹${Number(access.price || 0).toLocaleString('en-IN')}`;
  const isFree = access.isFree;
  const isEnrolled = access.enrolled;

  /* ================= ANIMATION VARIANTS ================= */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0.3 : 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
      
      {/* ================= PROCESSING OVERLAY ================= */}
      <AnimatePresence>
        {enrolling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 text-center max-w-sm w-full mx-auto border border-gray-100"
            >
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Processing Enrollment</h3>
              <p className="text-gray-500 text-sm">
                Please wait while we set up your course access...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto" ref={contentRef}>
        {/* Breadcrumb Navigation - MOBILE OPTIMIZED */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto whitespace-nowrap pb-2 -mx-3 px-3"
        >
          <button 
            onClick={() => navigate('/catalog')}
            className="hover:text-indigo-600 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Course Catalog</span>
            <span className="sm:hidden">Catalog</span>
          </button>
          <span className="mx-2 flex-shrink-0">/</span>
          <span className="text-gray-800 font-medium truncate">{course.title}</span>
        </motion.div>

        {/* Main Grid Layout - FIXED FOR MOBILE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ================= MAIN CONTENT ================= */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0"
          >
            {/* Course Header */}
            <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-indigo-600 font-medium">
                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{meta.category || "Professional Development"}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text leading-tight break-words">
                {course.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {course.teacher?.avatar ? (
                      <img 
                        src={course.teacher.avatar} 
                        alt={course.teacher.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      By {course.teacher?.name || course.teacherName || "Expert Instructor"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 text-amber-400 fill-current flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">
                        {avgRating.toFixed(1)} ({totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                {meta.students && (
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-gray-200 flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {Number(meta.students).toLocaleString('en-IN')} students
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tab Navigation - SCROLLABLE ON MOBILE */}
            <motion.div variants={itemVariants} className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
                {["description", "curriculum", "instructor", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors flex-shrink-0 ${
                      activeTab === tab
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: prefersReducedMotion ? 0.2 : 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="p-4 sm:p-6 md:p-8">
                  {/* Description Tab */}
                  {activeTab === "description" && (
                    <div className="prose prose-indigo prose-sm sm:prose-base max-w-none">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Course Description</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base break-words">
                        {course.description || "Comprehensive course description will be available soon."}
                      </p>
                      
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                          What You'll Learn
                        </h3>
                        <ul className="grid grid-cols-1 gap-2 sm:gap-3">
                          {(course.outcomes || ["Master core concepts", "Apply skills to real-world projects", "Earn a certificate of completion"]).map((outcome, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                          Requirements
                        </h3>
                        <ul className="space-y-2 text-gray-700 text-sm">
                          {(course.requirements || ["Basic computer skills", "Internet connection", "Enthusiasm to learn"]).map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-indigo-600 mt-1 flex-shrink-0">•</span>
                              <span className="break-words">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Curriculum Tab */}
                  {activeTab === "curriculum" && (
                    <div className="space-y-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Course Curriculum</h2>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                        {course.units?.length || 0} sections • {meta.totalLessons || 0} lessons • {course.duration || "20 hours"} total length
                      </p>
                      
                      <div className="divide-y divide-gray-100">
                        {course.units?.map((unit, unitIndex) => (
                          <div key={unitIndex} className="py-3 sm:py-4">
                            <button
                              onClick={() => setOpenUnit(openUnit === unitIndex ? null : unitIndex)}
                              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-indigo-600 transition-colors text-sm sm:text-base"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs sm:text-sm flex-shrink-0">
                                  {unitIndex + 1}
                                </div>
                                <span className="truncate">{unit.title}</span>
                              </div>
                              {openUnit === unitIndex ? (
                                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {openUnit === unitIndex && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: prefersReducedMotion ? 0.2 : 0.3 }}
                                  className="mt-3 sm:mt-4 ml-9 sm:ml-11 space-y-2 sm:space-y-3"
                                >
                                  {unit.lessons?.map((lesson, lessonIndex) => (
                                    <div 
                                      key={lessonIndex} 
                                      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-indigo-50/50 rounded-lg border border-indigo-100"
                                    >
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-medium text-[10px] sm:text-xs flex-shrink-0">
                                        {lessonIndex + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">{lesson.title}</p>
                                        {lesson.duration && (
                                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{lesson.duration}</p>
                                        )}
                                      </div>
                                      <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructor Tab */}
                  {activeTab === "instructor" && (
                    <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                      <div className="md:w-48 flex-shrink-0">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg mx-auto">
                          {course.teacher?.avatar ? (
                            <img 
                              src={course.teacher.avatar} 
                              alt={course.teacher.name} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                              <User className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-90" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                          {course.teacher?.name || course.teacherName || "Expert Instructor"}
                        </h2>
                        <p className="text-indigo-600 font-medium mb-2 sm:mb-3 text-sm">{course.teacher?.title || "Senior Educator & Industry Professional"}</p>
                        <p className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm break-words">
                          {course.teacher?.bio || "An experienced educator with a passion for teaching and helping students achieve their goals. With years of industry experience, they bring practical insights and real-world knowledge to every lesson."}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl text-center">
                            <div className="text-xl sm:text-2xl font-bold text-indigo-700">
                              {course.teacher?.totalStudents ? Number(course.teacher.totalStudents).toLocaleString('en-IN') : '10K+'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Students</div>
                          </div>
                          <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl text-center">
                            <div className="text-xl sm:text-2xl font-bold text-indigo-700">
                              {course.teacher?.totalCourses || '15+'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Courses</div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-indigo-100 rounded-lg flex-shrink-0">
                              <MessageCircle className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1 text-sm">Instructor's Message</h3>
                              <p className="text-gray-700 italic text-sm break-words">
                                "I'm passionate about helping you achieve your learning goals. This course is designed with practical, real-world applications in mind. I'm here to support you every step of the way!"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === "reviews" && (
                    <div className="space-y-6 sm:space-y-8">
                      <div className="text-center mb-6 sm:mb-8">
                        <div className="flex justify-center gap-1 sm:gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-6 h-6 sm:w-8 sm:h-8 ${
                                i < Math.round(avgRating) 
                                  ? "text-amber-400 fill-current" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</h2>
                        <p className="text-gray-600 text-sm">
                          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                        </p>
                      </div>
                      
                      <div className="space-y-4 sm:space-y-6">
                        {reviews.length === 0 ? (
                          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl px-4">
                            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3 sm:mb-4">
                              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">No reviews yet</h3>
                            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                              Be the first to share your experience with this course! Enroll now and leave a review after completing the course.
                            </p>
                          </div>
                        ) : (
                          reviews.map((review, index) => (
                            <div 
                              key={index} 
                              className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0 last:pb-0"
                            >
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                    {review.student?.avatar ? (
                                      <img 
                                        src={review.student.avatar} 
                                        alt={review.student.name} 
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <span className="text-indigo-700 font-bold text-sm sm:text-lg">
                                        {review.student?.name?.charAt(0) || 'S'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-gray-900 text-sm truncate">{review.student?.name || "Student"}</h4>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                              i < review.rating 
                                                ? "text-amber-400 fill-current" 
                                                : "text-gray-300"
                                            }`} 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      }) : 'Recent'}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 mt-2 sm:mt-3 italic leading-relaxed text-sm break-words">
                                    "{review.comment || "Great course with excellent content and teaching style!"}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ================= SIDEBAR - MOBILE OPTIMIZED ================= */}
          <motion.div 
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
            className="space-y-4 lg:space-y-6"
          >
            {/* Course Thumbnail Card - FIXED ASPECT RATIO */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden lg:sticky lg:top-6">
              <div className="relative w-full aspect-[16/9] sm:aspect-[4/3] lg:aspect-[16/9] overflow-hidden">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />
                  </div>
                )}
                {isEnrolled && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-lg">
                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Enrolled</span>
                    <span className="sm:hidden">✓</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-amber-400">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current flex-shrink-0" />
                    <span className="font-bold text-gray-900 text-sm">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-500 text-xs">({totalReviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">{Number(meta.students || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium">{meta.totalLessons || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-medium">{course.duration || "Self-paced"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">Certificate</span>
                  </div>
                </div>
                
                <div className="pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-end justify-between mb-4 sm:mb-6">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Price</p>
                      <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
                        {priceLabel}
                      </p>
                    </div>
                    {isFree && !isEnrolled && (
                      <span className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] sm:text-xs font-medium">
                        Free
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className={`w-full py-3 rounded-xl font-bold text-base transition-all relative overflow-hidden min-h-[44px] touch-manipulation ${
                      enrolling
                        ? "bg-indigo-400 text-white cursor-wait"
                        : isEnrolled
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                        : isFree
                        ? "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-lg"
                        : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
                    }`}
                  >
                    {enrolling ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </div>
                    ) : isEnrolled ? (
                      <>
                        <PlayCircle className="w-4 h-4 inline mr-1.5" />
                        Start Learning
                      </>
                    ) : isFree ? (
                      "Enroll for Free"
                    ) : (
                      "Buy Now"
                    )}
                  </button>

                  <button
                    onClick={handleAddToWishlist}
                    disabled={savingWishlist}
                    className={`w-full mt-3 py-3 rounded-xl font-semibold text-sm border transition-all min-h-[44px] touch-manipulation ${
                      savingWishlist
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-wait"
                        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {savingWishlist ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 inline mr-1.5" />
                        Add to Wishlist
                      </>
                    )}
                  </button>
                  
                  <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                    <span>30-day guarantee</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Course Stats Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-5 text-indigo-600 flex-shrink-0" />
                Course Details
              </h3>
              <ul className="space-y-2.5 text-gray-700 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  <span>Full lifetime access</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  <span>Mobile & TV access</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  <span>Certificate of completion</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  <span>24/7 Instructor support</span>
                </li>
              </ul>
            </div>
            
            {/* Share Course Card - Hidden on very small screens if needed */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4 text-center hidden sm:block">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Share this course</h3>
              <p className="text-gray-600 text-xs mb-3">
                Know someone who would benefit? Share it!
              </p>
              <div className="flex justify-center gap-2">
                {[FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon].map((Icon, index) => (
                  <button 
                    key={index} 
                    className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-indigo-50 transition-colors min-h-[36px] min-w-[36px]"
                  >
                    <Icon className="w-4 h-4 text-gray-700" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const ChevronLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.852V15.467c0-.533.115-1.043.314-1.517.658-1.552 2.435-3.94 2.435-3.94s-.398-.796-.398-1.583c0-.712.324-1.307.789-1.684.729-.594 1.749-1.014 2.773-1.014 3.276 0 5.391 2.846 5.391 6.396 0 3.552-2.115 6.394-5.391 6.394-1.024 0-2.044-.42-2.773-1.014-.465-.377-.789-.972-.789-1.684 0-.787.398-1.583.398-1.583s1.777 2.388 2.435 3.94c.199.474.314.984.314 1.517v8.385C19.612 22.954 24 17.99 24 12z" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
  </svg>
);

const WhatsappIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.199.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.493h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.648a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
