import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlayCircle, 
  Award, 
  GraduationCap, 
  Clock, 
  User,
  AlertCircle
} from "lucide-react";

const FALLBACK_THUMBNAIL = import.meta.env.VITE_FALLBACK_THUMBNAIL || "/placeholder-course.jpg";

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // Calculate safe progress value
  const progress = Math.min(Math.max(course.progress || 0, 0), 100);
  const isCompleted = progress === 100;
  const instructorName = course.instructor?.name || course.teacher?.name || "Instructor";

  // Handle image load errors
  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = FALLBACK_THUMBNAIL;
  };

  const openCourse = () => {
    // ✅ CORRECTED PATH TO MATCH ROUTER
    navigate(`/player/${course._id}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Course Thumbnail with Status Badge */}
      <div className="relative">
        <img
          src={imageError ? FALLBACK_THUMBNAIL : course.thumbnail || FALLBACK_THUMBNAIL}
          alt={course.title || "Course thumbnail"}
          className="w-full h-48 object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Award className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        )}
        
        {/* Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30 backdrop-blur-sm">
          <div
            className={`h-full transition-all duration-700 ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Course Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[48px] mb-3">
          {course.title || "Untitled Course"}
        </h3>

        {/* Course Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="w-4 h-4 flex-shrink-0 text-indigo-600" />
            <span className="truncate">{instructorName}</span>
          </div>
          
          {course.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{course.duration}</span>
            </div>
          )}
          
          {course.level && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 flex-shrink-0 text-blue-600" />
              <span>{course.level}</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700">Progress</span>
            <span className={`font-bold ${
              isCompleted ? "text-emerald-600" : "text-indigo-600"
            }`}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                isCompleted
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={openCourse}
          className={`mt-auto w-full py-2.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow ${
            isCompleted
              ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200"
              : "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg"
          }`}
          aria-label={isCompleted ? `View ${course.title}` : `Start ${course.title}`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>{isCompleted ? "View Course" : progress > 0 ? "Continue Learning" : "Start Learning"}</span>
        </button>
      </div>
    </div>
  );
}