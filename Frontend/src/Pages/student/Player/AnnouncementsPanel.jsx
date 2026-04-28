import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { studentAPI } from "@/lib/api";
import { 
  Megaphone, 
  CalendarDays, 
  AlertCircle, 
  Loader,
  Bell,
  Sparkles
} from "lucide-react";

export default function AnnouncementsPanel({ courseId, isMobile = false }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format date with relative time - simplified for mobile
  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return "Just now";
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      // Mobile: shorter date format
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: isMobile ? undefined : 'numeric'
      });
    };
  }, [isMobile]);

  useEffect(() => {
    if (!courseId) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await studentAPI.get(`/courses/${courseId}/announcements`);
        
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.announcements)
          ? res.data.announcements
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
          
        setAnnouncements(data);
      } catch (err) {
        console.error("ANNOUNCEMENT LOAD ERROR:", err);
        setError(err.response?.data?.message || "Failed to load announcements.");
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [courseId]);

  // Determine announcement type based on content
  const getAnnouncementType = (message) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('important') || lowerMsg.includes('urgent') || lowerMsg.includes('deadline')) 
      return 'urgent';
    if (lowerMsg.includes('reminder') || lowerMsg.includes('update')) 
      return 'reminder';
    if (lowerMsg.includes('congrat') || lowerMsg.includes('celebrat') || lowerMsg.includes('well done')) 
      return 'celebration';
    return 'general';
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 animate-pulse"
          >
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4 mb-2 sm:mb-3"></div>
            <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-full mb-1.5 sm:mb-2"></div>
            <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
            <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header - MOBILE OPTIMIZED */}
      <div className="flex items-start sm:items-center gap-3 mb-5 sm:mb-8">
        <div className="bg-indigo-100 p-2 rounded-xl sm:p-2.5 flex-shrink-0">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
            Course Announcements
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-2">
            Important updates from your instructor
          </p>
        </div>
      </div>

      {/* Error Message - Mobile Friendly */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-start sm:items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        // Empty State - Simplified for Mobile
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-indigo-50 mb-3 sm:mb-4">
            <Megaphone className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
            No Announcements Yet
          </h3>
          <p className="text-gray-600 text-sm max-w-sm mx-auto px-2">
            Your instructor hasn't posted any announcements yet. Check back later for updates.
          </p>
          <div className="mt-4 sm:mt-6 flex justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 sm:px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
              <span className="line-clamp-1">Updates will appear here</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-5">
          {announcements.map((a) => {
            const type = getAnnouncementType(a.message);
            const isUrgent = type === 'urgent';
            const isCelebration = type === 'celebration';
            
            return (
              <article
                key={a._id}
                className={`bg-white rounded-xl sm:rounded-2xl border overflow-hidden ${
                  isUrgent 
                    ? 'border-rose-200 bg-rose-50/50' 
                    : isCelebration
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-gray-100'
                } shadow-sm`}
              >
                {/* Color Bar - Thinner on mobile */}
                <div className={`h-1 sm:h-1.5 ${
                  isUrgent ? 'bg-rose-500' : 
                  isCelebration ? 'bg-amber-500' : 
                  'bg-indigo-600'
                }`}></div>
                
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col gap-3">
                    {/* Content Section */}
                    <div className="flex gap-3 min-w-0">
                      {/* Icon */}
                      <div className={`mt-0.5 flex-shrink-0 p-1.5 sm:p-2 rounded-lg ${
                        isUrgent 
                          ? 'bg-rose-100' 
                          : isCelebration
                          ? 'bg-amber-100'
                          : 'bg-indigo-100'
                      }`}>
                        <Megaphone className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          isUrgent ? 'text-rose-600' : 
                          isCelebration ? 'text-amber-600' : 
                          'text-indigo-600'
                        }`} />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <h3 className={`font-bold text-sm sm:text-base ${
                            isUrgent ? 'text-rose-800' : 
                            isCelebration ? 'text-amber-800' : 
                            'text-gray-900'
                          }`}>
                            {isUrgent && '❗ '} 
                            {isCelebration && '🎉 '}
                            Announcement
                          </h3>
                          <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${
                            isUrgent 
                              ? 'bg-rose-200 text-rose-800' 
                              : isCelebration
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        </div>
                        
                        {/* Message - Line clamped on mobile */}
                        <div 
                          className={`text-gray-800 leading-relaxed whitespace-pre-wrap break-words ${
                            isUrgent ? 'font-medium' : ''
                          } ${isMobile ? 'line-clamp-4 sm:line-clamp-none' : ''} text-sm`}
                        >
                          {a.message}
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer: Date + Badge */}
                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100/50 mt-2 sm:mt-3">
                      <div className={`flex items-center gap-1.5 ${
                        isUrgent ? 'text-rose-600 font-medium' : 'text-gray-500'
                      }`}>
                        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs whitespace-nowrap">
                          {formatDate(a.createdAt)}
                        </span>
                      </div>
                      {isUrgent && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] sm:text-xs font-bold rounded-full">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
