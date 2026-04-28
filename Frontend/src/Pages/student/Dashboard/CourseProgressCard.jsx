import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronRight, 
  BookOpen, 
  Award, 
  Star, 
  Send, 
  AlertCircle,
  Loader,
  Edit3,
  CheckCircle
} from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";
const FALLBACK_THUMBNAIL = import.meta.env.VITE_FALLBACK_THUMBNAIL || "/placeholder-course.jpg";

export default function CourseProgressCard({ course, onContinue }) {
  // 🔥 Use safe progress value
  const progress = Math.min(Math.max(course.progress || 0, 0), 100);
  const completed = course.completed || progress === 100;
  
  // ⭐ Review state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewMessageType, setReviewMessageType] = useState("success");
  const textareaRef = useRef(null);

  // Load existing review if any
  useEffect(() => {
    if (completed && course.userReview) {
      setRating(course.userReview.rating || 0);
      setComment(course.userReview.comment || "");
      setHasReviewed(true);
    }
  }, [completed, course]);

  // Auto-focus textarea when comment box opens
  useEffect(() => {
    if (showCommentBox && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showCommentBox]);

  // Handle rating click
  const handleRatingClick = (star) => {
    setRating(star);
    setShowCommentBox(true);
    setReviewMessage("");
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (rating === 0) {
      showReviewMessage("Please select a rating", "error");
      return;
    }

    if (!comment.trim()) {
      showReviewMessage("Please add a comment", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      setReviewMessage("");
      setReviewMessageType("success");

      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await axios.post(
        `${API}/courses/${course._id}/review`,
        {
          rating,
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setHasReviewed(true);
        showReviewMessage(hasReviewed ? "Review updated successfully!" : "Review submitted successfully!", "success");
        if (!hasReviewed) {
          setShowCommentBox(false);
        }
      } else {
        throw new Error(response.data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      showReviewMessage(
        error?.response?.data?.message || error.message || "Failed to submit review. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showReviewMessage = (message, type) => {
    setReviewMessage(message);
    setReviewMessageType(type);
    setTimeout(() => {
      if (reviewMessage === message) {
        setReviewMessage("");
      }
    }, 5000);
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = FALLBACK_THUMBNAIL;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Thumbnail with Status Badge */}
      <div className="relative">
        <img
          src={course.thumbnail || FALLBACK_THUMBNAIL}
          alt={course.title || "Course thumbnail"}
          className="w-full h-44 object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        {completed && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Award className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        )}
        
        {/* Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30 backdrop-blur-sm">
          <div
            className={`h-full transition-all duration-700 ${
              completed 
                ? "bg-gradient-to-r from-emerald-500 to-teal-600" 
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[48px] mb-3">
          {course.title || "Untitled Course"}
        </h3>

        {/* Progress Details */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700">Progress</span>
            <span className={`font-bold ${
              completed ? "text-emerald-600" : "text-indigo-600"
            }`}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                completed 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600" 
                  : "bg-gradient-to-r from-indigo-500 to-purple-600"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Continue / View Course Button */}
        <button
          onClick={onContinue}
          className={`mt-auto w-full py-2.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow ${
            completed
              ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200"
              : "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg"
          }`}
          aria-label={completed ? `View ${course.title}` : `Continue ${course.title}`}
        >
          {completed ? (
            <>
              <BookOpen className="w-4 h-4" />
              <span>View Course</span>
            </>
          ) : (
            <>
              <span>Continue Learning</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* ⭐⭐⭐⭐⭐ RATING SECTION (COMPLETED COURSES ONLY) */}
        {completed && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">
                {hasReviewed ? "Your Review" : "Rate This Course"}
              </p>
              {hasReviewed && !showCommentBox && (
                <button
                  onClick={() => {
                    setShowCommentBox(true);
                    setReviewMessage("");
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
                  aria-label="Edit review"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {/* Star Rating */}
            <div className="flex gap-1.5 text-2xl mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={isSubmitting || (hasReviewed && !showCommentBox)}
                  className={`transition-all duration-200 transform ${
                    isSubmitting || (hasReviewed && !showCommentBox)
                      ? "cursor-not-allowed opacity-50"
                      : "hover:scale-110"
                  }`}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                    size={24}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-xs text-gray-600 mb-3 font-medium">
                {rating} out of 5 stars
              </p>
            )}

            {/* Comment Box */}
            {(showCommentBox || (hasReviewed && !comment)) && (
              <div className="mt-3 space-y-3 animate-fadeIn">
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setReviewMessage("");
                  }}
                  placeholder="Share your experience with this course... What did you enjoy? How could it be improved?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm transition-all"
                  rows={3}
                  disabled={isSubmitting}
                  aria-label="Review comment"
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || !comment.trim() || rating === 0}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        isSubmitting || !comment.trim() || rating === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-md"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{hasReviewed ? "Update Review" : "Submit Review"}</span>
                        </>
                      )}
                    </button>

                    {showCommentBox && (
                      <button
                        onClick={() => {
                          setShowCommentBox(false);
                          setComment(hasReviewed ? comment : "");
                          setReviewMessage("");
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  
                  {rating > 0 && !hasReviewed && (
                    <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full font-medium self-start sm:self-center">
                      <Star className="w-3 h-3 inline mr-1" />
                      Your feedback helps other students!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Existing Review Display */}
            {hasReviewed && !showCommentBox && comment && (
              <div className="mt-3 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-amber-100 rounded-lg">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < rating 
                              ? "fill-amber-400 text-amber-400" 
                              : "text-gray-300"
                          }`} 
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        ({rating}/5)
                      </span>
                    </div>
                    <p className="text-gray-800 italic leading-relaxed text-sm">
                      "{comment}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success/Error Message */}
            {reviewMessage && (
              <div
                className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
                  reviewMessageType === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-rose-50 text-rose-800 border border-rose-100"
                }`}
                role="alert"
              >
                {reviewMessageType === "success" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{reviewMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
