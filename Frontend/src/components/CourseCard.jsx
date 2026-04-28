import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Star, 
  Users, 
  IndianRupee, 
  Award, 
  PlayCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

export default function CourseCard({ course }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  // Handle image load error with fallback
  const handleImageError = (e) => {
    setImageError(true);
    e.target.onerror = null;
    e.target.src = "https://placehold.co/600x400/indigo-50/indigo-600?text=Course+Preview";
  };

  // Format price with Indian numbering system
  const formatPrice = (price) => {
    if (price === 0 || course.isFree) return "Free";
    return `₹${Number(price).toLocaleString('en-IN')}`;
  };

  // Calculate rating display
  const rating = course.avgRating || course.rating || 0;
  const ratingCount = course.ratingCount || course.totalReviews || 0;
  const students = course.students || course.enrolledStudents || 0;
  const formattedStudents = students >= 1000 
    ? `${(students / 1000).toFixed(1)}K` 
    : students.toString();

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Course Thumbnail with Hover Effect */}
        <div className="relative h-48 overflow-hidden group">
          <img
            src={imageError ? "https://placehold.co/600x400/indigo-50/indigo-600?text=Course+Preview" : course.thumbnail}
            alt={course.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Free Badge */}
          {(course.isFree || course.price === 0) && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
              FREE
            </div>
          )}
          
          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-white space-y-2 w-full"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-indigo-200 mt-1 flex items-center">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {course.instructor?.name || course.teacherName || "Expert Instructor"}
                      </p>
                    </div>
                    <div className="flex items-center bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      <Star className="w-3 h-3 fill-current mr-0.5" />
                      {rating.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-indigo-200">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{formattedStudents} students</span>
                    </div>
                    <div className="flex items-center text-indigo-200">
                      <Award className="w-3 h-3 mr-1" />
                      <span>Certificate</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Preview Course</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Progress Bar (if enrolled) */}
          {course.progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" 
                style={{ width: `${Math.min(Math.max(course.progress, 0), 100)}%` }}
              />
            </div>
          )}
        </div>
        
        {/* Course Content */}
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="space-y-3 flex-1">
            {/* Course Title */}
            <h2 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[48px] hover:text-indigo-700 transition-colors">
              {course.title}
            </h2>
            
            {/* Instructor */}
            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 text-indigo-500 mr-1.5 flex-shrink-0" />
              <span className="truncate">
                {course.instructor?.name || course.teacherName || "Expert Instructor"}
              </span>
            </div>
            
            {/* Rating and Students */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center text-amber-400">
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
                <span className="ml-1 text-xs text-gray-600 font-medium">
                  ({ratingCount})
                </span>
              </div>
              
              <div className="flex items-center text-gray-500 text-sm">
                <Users className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs">{formattedStudents} students</span>
              </div>
            </div>
            
            {/* Description (if available) */}
            {course.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {course.description.substring(0, 100)}...
              </p>
            )}
          </div>
          
          {/* Footer with Price and CTA */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
                  {formatPrice(course.price || 0)}
                </span>
                {!course.isFree && course.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{Number(course.originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              
              <Link 
                to={`/course/${course._id || course.id}`}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                onClick={(e) => {
                  // Prevent card hover effect from interfering
                  e.stopPropagation();
                }}
              >
                View Details
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-4 h-4 ml-1"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            
            {/* Category Badge */}
            {course.category && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                  {course.category}
                </span>
                {course.level && (
                  <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                    {course.level}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Error Boundary */}
      <AnimatePresence>
        {imageError && !course.thumbnail && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Thumbnail unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}