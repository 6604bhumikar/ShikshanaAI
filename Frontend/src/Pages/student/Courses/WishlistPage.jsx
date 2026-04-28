import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  PlayCircle, 
  Trash2, 
  AlertCircle,
  Loader,
  BookOpen,
  Sparkles
} from "lucide-react";
import { toast } from 'react-toastify';

// 🔥 Set backend base URL once (moved inside component to avoid global pollution)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:5000";
const API_WISHLIST = "/api/student/wishlist";
const FALLBACK_THUMBNAIL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200' viewBox='0 0 320 200'%3E%3Crect width='320' height='200' fill='%23fff1f2'/%3E%3Cpath d='M160 68c25-42 95-14 70 43-14 32-46 54-70 73-24-19-56-41-70-73-25-57 45-85 70-43z' fill='%23fb7185'/%3E%3C/svg%3E";

export default function WishlistPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchWishlist();
  }, [navigate, token]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}${API_WISHLIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle different API response structures
      const wishlistData = Array.isArray(res.data) 
        ? res.data 
        : res.data?.wishlist || res.data?.courses || [];
        
      setItems(wishlistData);
    } catch (err) {
      console.error("Wishlist load error:", err);
      const errorMsg = err.response?.data?.message || "Failed to load wishlist. Please try again.";
      toast.error(errorMsg, { 
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (courseId) => {
    if (removingId === courseId) return;
    
    try {
      setRemovingId(courseId);
      
      await axios.delete(`${API_BASE}${API_WISHLIST}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(prev => prev.filter(c => c._id !== courseId));
      
      toast.success("Removed from wishlist", {
        autoClose: 2500,
        position: "top-center",
        theme: "colored"
      });
    } catch (err) {
      console.error("Remove wishlist error:", err);
      toast.error("Failed to remove item. Please try again.", {
        autoClose: 3000,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setRemovingId(null);
    }
  };

  /* =============================
      SKELETON LOADER
  ============================== */
  const WishlistSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-3 pt-2">
          <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
          <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-rose-100 p-3 rounded-2xl">
              <Heart className="w-8 h-8 text-rose-600 fill-rose-100" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-600">
            My Wishlist
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mt-3">
            Save courses you're interested in and revisit them anytime. 
            Your perfect learning path is just a click away!
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <WishlistSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center max-w-3xl mx-auto">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 mb-4">
              <Heart className="h-8 w-8 text-rose-600 fill-rose-100" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Discover courses that spark your interest and save them here for later. 
              Build your personalized learning collection!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/catalog')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Discover Courses
              </button>
              <button
                onClick={() => navigate('/my-learning')}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                My Learning
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
                <span className="font-medium text-lg">{items.length} {items.length === 1 ? 'Course' : 'Courses'} Saved</span>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors text-sm"
              >
                Discover More Courses
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Course Thumbnail */}
                  <div className="relative">
                    <img
                      src={course.thumbnail || FALLBACK_THUMBNAIL}
                      alt={course.title || "Course thumbnail"}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = FALLBACK_THUMBNAIL;
                      }}
                      loading="lazy"
                    />
                    {/* Wishlist Badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Heart className="w-3 h-3 fill-white" />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {/* Course Title */}
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[48px] mb-3">
                      {course.title || "Untitled Course"}
                    </h2>

                    {/* Course Details */}
                    <div className="space-y-1.5 mb-4 flex-1">
                      {course.instructor?.name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span className="truncate">{course.instructor.name}</span>
                        </div>
                      )}
                      
                      {course.price !== undefined && (
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                          <span>₹{Number(course.price).toLocaleString('en-IN')}</span>
                          {course.discount && (
                            <span className="text-xs line-through text-gray-400">
                              ₹{Number(course.originalPrice || course.price * 1.5).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${course._id}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-medium text-sm shadow transition-all"
                        aria-label={`View details for ${course.title}`}
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span className="hidden xs:inline">View Course</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(course._id);
                        }}
                        disabled={removingId === course._id}
                        className={`p-2.5 rounded-xl transition-all ${
                          removingId === course._id
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        }`}
                        aria-label={`Remove ${course.title} from wishlist`}
                      >
                        {removingId === course._id ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
