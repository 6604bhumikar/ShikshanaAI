import React, { useEffect, useState, useRef } from "react";
import adminAPI from "../../lib/adminApi";
import { Button } from "../../components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertCircle, 
  Loader,
  Search,
  Filter,
  ShieldCheck,
  BookOpen,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CourseModeration() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [courseActionId, setCourseActionId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const rejectReasonRef = useRef(null);

  /* ======================
     LOAD PENDING COURSES
  ====================== */
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await adminAPI.get("/courses?status=review");
      setCourses(Array.isArray(res.data.courses) ? res.data.courses : []);
    } catch (error) {
      console.error("Failed to load courses", error);
      setError("Failed to load courses. Please try again.");
      toast.error("Unable to load pending courses. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  /* ======================
     PAGINATION
  ====================== */
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  /* ======================
     APPROVE COURSE
  ====================== */
  const handleApproveClick = (courseId) => {
    setCourseActionId(courseId);
    setShowApproveModal(true);
  };

  const approveCourse = async () => {
    if (!courseActionId) return;

    try {
      setActionLoading(true);
      
      await adminAPI.patch(`/courses/${courseActionId}/status`, {
        status: "published",
      });
      
      toast.success("✅ Course approved successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      
      loadCourses();
      setShowApproveModal(false);
    } catch (error) {
      console.error("Failed to approve course", error);
      toast.error(error?.response?.data?.message || "Failed to approve course. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
    } finally {
      setActionLoading(false);
      setCourseActionId(null);
    }
  };

  /* ======================
     REJECT COURSE
  ====================== */
  const handleRejectClick = (courseId) => {
    setCourseActionId(courseId);
    setRejectReason("");
    setShowRejectModal(true);
    setTimeout(() => {
      rejectReasonRef.current?.focus();
    }, 100);
  };

  const rejectCourse = async () => {
    if (!courseActionId || !rejectReason.trim()) {
      toast.warn("Please provide a reason for rejection", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    try {
      setActionLoading(true);
      
      await adminAPI.patch(`/courses/${courseActionId}/status`, {
        status: "rejected",
        reason: rejectReason.trim(),
      });
      
      toast.success("✅ Course rejected successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      
      loadCourses();
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject course", error);
      toast.error(error?.response?.data?.message || "Failed to reject course. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
    } finally {
      setActionLoading(false);
      setCourseActionId(null);
    }
  };

  /* ======================
     SKELETON LOADER
  ====================== */
  const CourseSkeleton = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="space-x-2 flex">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  /* ======================
     EMPTY STATE
  ====================== */
  if (!loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-100 mb-6">
              <ShieldCheck className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">No Courses Pending Approval</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              All courses have been reviewed. New submissions will appear here automatically.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={() => loadCourses()}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
              >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Refresh List
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-8 py-3 rounded-xl font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
          className="absolute -top-48 -left-48 w-[80rem] h-[80rem] bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full blur-3xl"
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
          className="absolute -bottom-48 -right-48 w-[70rem] h-[70rem] bg-gradient-to-r from-amber-300 to-pink-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
                Course Moderation
              </h1>
              <p className="text-gray-600 mt-1">
                Review and approve course submissions from instructors
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            <Button
              onClick={loadCourses}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-colors"
            >
              <RefreshIcon className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Courses List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 mb-3 sm:mb-0">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Pending Courses</h2>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>{courses.length} course{courses.length !== 1 ? 's' : ''} pending review</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Instructor</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Submitted</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="p-0">
                        <CourseSkeleton />
                      </td>
                    </tr>
                  ))
                ) : (
                  currentCourses.map((course) => (
                    <motion.tr
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1.5 bg-indigo-100 rounded-lg">
                            <BookOpen className="w-4 h-4 text-indigo-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 line-clamp-1">{course.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                              {course.description?.substring(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="font-medium text-gray-900">{course.teacher?.name || "— "}</div>
                        <div className="text-sm text-gray-500">{course.teacher?.email || "—"}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                          {course.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {course.createdAt 
                            ? new Date(course.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCourse(course)}
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 p-2"
                            aria-label="View course details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveClick(course._id)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-2"
                            aria-label="Approve course"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectClick(course._id)}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-2"
                            aria-label="Reject course"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && courses.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstCourse + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastCourse, courses.length)}</span> of{" "}
                <span className="font-medium">{courses.length}</span> courses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-gray-200 p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (pageNumber === 1 || pageNumber === totalPages || 
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                      return (
                        <Button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          className={`w-8 h-8 p-0 text-sm ${
                            currentPage === pageNumber 
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                              : "border-gray-200"
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    }
                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return <span key={`ellipsis-${pageNumber}`} className="px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="border-gray-200 p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================
          VIEW COURSE MODAL
      ====================== */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Course Verification
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCourse(null)}
                  className="text-white hover:bg-white/20"
                >
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Course Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Title</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCourse.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Category</label>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                      {selectedCourse.category || "General"}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Price</label>
                    <p className="font-medium text-gray-900">
                      {selectedCourse.isFree ? "Free" : `₹${Number(selectedCourse.price || 0).toLocaleString('en-IN')}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Language</label>
                    <p className="text-gray-900">{selectedCourse.language || "English"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Skill Level</label>
                    <p className="text-gray-900 capitalize">{selectedCourse.skillLevel || "Beginner"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Total Lessons</label>
                    <p className="text-gray-900">{selectedCourse.totalLessons || 0}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Description</label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 whitespace-pre-line">{selectedCourse.description}</p>
                  </div>
                </div>
                
                {/* Instructor Information */}
                <div className="border rounded-2xl p-5 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Instructor Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="font-medium text-gray-900">{selectedCourse.teacher?.name || "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-700">{selectedCourse.teacher?.email || "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bio</label>
                      <p className="text-gray-700">{selectedCourse.teacher?.bio || "No bio provided"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Course Structure */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Course Structure
                  </h3>
                  
                  {selectedCourse.units?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCourse.units.map((unit, index) => (
                        <div
                          key={unit._id || index}
                          className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="font-bold text-gray-900">{unit.title}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {unit.lessons?.length || 0} lesson{unit.lessons?.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <span className="px-3 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full whitespace-nowrap">
                              Unit {index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center">
                      <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                      </div>
                      <p className="text-gray-600">No units added to this course yet</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-5 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-2.5"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================
          APPROVE CONFIRMATION MODAL
      ====================== */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Approve Course?</h2>
                <p className="text-gray-600 mb-6">
                  This will publish the course and make it available to all students. 
                  Are you sure you want to approve this course?
                </p>
                
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1 py-2.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={approveCourse}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Approving...
                      </div>
                    ) : (
                      "Approve Course"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================
          REJECT MODAL
      ====================== */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <XCircle className="w-6 h-6 text-rose-600" />
                    Reject Course
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowRejectModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Please provide a detailed reason for rejecting this course. 
                  The instructor will receive this feedback and can resubmit after making improvements.
                </p>
                
                <div className="mb-6">
                  <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    ref={rejectReasonRef}
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide specific feedback on what needs improvement..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all min-h-[120px] resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">{rejectReason.length}/500</p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 py-2.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={rejectCourse}
                    disabled={actionLoading || rejectReason.trim().length === 0}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Rejecting...
                      </div>
                    ) : (
                      "Reject Course"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0113.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);