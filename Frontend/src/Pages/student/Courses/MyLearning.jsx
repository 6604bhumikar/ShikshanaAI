import React, { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "./CourseCard";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  AlertCircle, 
  Loader,
  BookOpen,
  Sparkles
} from "lucide-react";
import { toast } from 'react-toastify';

export default function MyLearning() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";
  const token = localStorage.getItem("accessToken");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  /* =============================
      LOAD ENROLLED COURSES
  ============================== */
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API}/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle different API response structures
      const coursesData = Array.isArray(res.data) 
        ? res.data 
        : res.data?.courses || res.data?.enrolledCourses || [];
        
      setCourses(coursesData);
    } catch (err) {
      console.error("MyLearning load error:", err);
      const errorMsg = err.response?.data?.message || "Failed to load your courses. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg, { 
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  /* =============================
      SKELETON LOADER
  ============================== */
  const CourseSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
        <div className="h-2 bg-gray-200 rounded w-5/6"></div>
        <div className="h-9 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            My Learning Journey
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mt-3">
            Continue your educational journey. Track your progress and revisit courses anytime.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center gap-3 max-w-3xl mx-auto">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              <button
                onClick={loadCourses}
                className="mt-2 text-sm text-rose-800 hover:text-rose-900 font-medium flex items-center gap-1"
              >
                <Loader className="w-3.5 h-3.5 animate-spin" />
                Retry Loading
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center max-w-3xl mx-auto">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses Enrolled Yet</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              You haven't enrolled in any courses. Start your learning journey by exploring our course catalog!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/catalog')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Browse Courses
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">{courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Enrolled</span>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors text-sm"
              >
                Browse More Courses
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
