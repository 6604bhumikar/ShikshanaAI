import React, { useState, useEffect } from "react";
import { 
  Video, 
  FileText, 
  AlertCircle, 
  Download, 
  File, 
  Loader,
  PlayCircle,
  Link as LinkIcon,
  RefreshCw,
  Clock
} from "lucide-react";

export default function ResourceDisplay({ lesson, isMobile = false }) {
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [playableVideoUrl, setPlayableVideoUrl] = useState("");

  useEffect(() => {
    const url = lesson?.contentUrl || "";
    let objectUrl = "";
    let cancelled = false;

    setVideoError(false);
    setIsVideoLoaded(false);
    setPlayableVideoUrl("");

    if (!url) return undefined;

    const needsAuthFetch = url.includes("/api/media/stream/");
    if (!needsAuthFetch) {
      setPlayableVideoUrl(url);
      return undefined;
    }

    const loadProtectedVideo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Unable to load recorded lesson");
        }

        const blob = await response.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPlayableVideoUrl(objectUrl);
      } catch (error) {
        console.error("Protected video load failed", error);
        if (!cancelled) {
          setVideoError(true);
        }
      }
    };

    loadProtectedVideo();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [lesson?._id, lesson?.contentUrl]);

  if (!lesson) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-indigo-100 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Select a Lesson</h2>
        <p className="text-gray-600 text-sm max-w-sm mx-auto px-2">
          Choose a lesson from the navigation to start learning.
        </p>
      </div>
    );
  }

  const {
    title,
    type,
    contentUrl,
    textContent,
    attachments = [],
  } = lesson;

  // 🔥 Infer lesson type safely
  const resolvedType = type || (contentUrl ? "video" : textContent ? "text" : null);

  // 🟢 Detect YouTube links & convert to embed
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("watch?v=")) 
      return url.replace("watch?v=", "embed/").split('&')[0];
    if (url.includes("youtu.be/")) 
      return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
    return url;
  };

  // 🎥 Handle video load events
  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsVideoLoaded(false);
  };

  // 📄 Render text content with enhanced formatting - MOBILE OPTIMIZED
  const renderTextContent = () => {
    if (!textContent) return null;
    
    // Convert markdown-like syntax to HTML (basic support)
    const formattedContent = textContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">$1</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[10px] sm:text-xs">$1</code>')
      .replace(/\n/g, '<br/>');

    return (
      <div 
        className="prose prose-indigo prose-sm max-w-none bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  // 📎 Render attachments with file icons - MOBILE OPTIMIZED
  const renderAttachments = () => {
    if (attachments.length === 0) return null;
    
    return (
      <div className="mt-6 sm:mt-8">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <File className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
          <h3 className="text-base sm:text-xl font-bold text-gray-900">Attachments</h3>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {attachments.map((file, i) => {
            const fileName = file.split('/').pop() || `Attachment ${i + 1}`;
            const isPDF = file.toLowerCase().endsWith('.pdf');
            
            return (
              <a
                key={i}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all group min-h-[56px] touch-manipulation"
              >
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  {isPDF ? (
                    <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-600" />
                  ) : (
                    <File className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 group-hover:text-indigo-700 transition-colors text-sm line-clamp-1">
                    {fileName}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">Download</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-gray-400 flex-shrink-0 sm:hidden" />
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Lesson Title & Meta - MOBILE OPTIMIZED */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text leading-tight break-words">
          {title || "Untitled Lesson"}
        </h1>
        <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-sm font-medium ${
            resolvedType === 'video' 
              ? 'bg-blue-100 text-blue-800' 
              : resolvedType === 'text'
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {resolvedType === 'video' ? '📹 Video' : resolvedType === 'text' ? '📝 Text' : '📄 Content'}
          </span>
          {lesson.duration && (
            <span className="text-[10px] sm:text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {lesson.duration}
            </span>
          )}
        </div>
      </div>

      {/* Video Content - MOBILE OPTIMIZED */}
      {resolvedType === "video" && contentUrl && (
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {!isVideoLoaded && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl sm:rounded-2xl">
                <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-spin" />
              </div>
            )}
            
            {videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Video Unavailable</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 px-2">
                  This video could not be loaded. Please check your connection.
                </p>
                <button
                  onClick={() => {
                    setVideoError(false);
                    setIsVideoLoaded(false);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm min-h-[40px]"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Retry
                </button>
              </div>
            ) : contentUrl.includes("youtube") || contentUrl.includes("youtu.be") ? (
              <iframe
                src={getYouTubeEmbedUrl(contentUrl)}
                className={`absolute top-0 left-0 w-full h-full rounded-xl sm:rounded-2xl shadow-lg border-0 ${
                  isVideoLoaded ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Lesson Video"
                onLoad={handleVideoLoad}
                onError={handleVideoError}
              />
            ) : playableVideoUrl ? (
              <video
                src={playableVideoUrl}
                controls
                className={`absolute top-0 left-0 w-full h-full rounded-xl sm:rounded-2xl shadow-lg object-cover ${
                  isVideoLoaded ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                poster={`https://via.placeholder.com/1280x720/4f46e5/ffffff?text=${encodeURIComponent(title || 'Lesson Video')}`}
              />
            ) : null}
          </div>
          
          {/* Video Description - Compact on mobile */}
          {lesson.description && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-gray-700 italic leading-relaxed text-sm">{lesson.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Text Content - MOBILE OPTIMIZED */}
      {resolvedType === "text" && (
        <div className="mb-6 sm:mb-8">
          {renderTextContent()}
        </div>
      )}

      {/* No Content Fallback - Simplified */}
      {!resolvedType && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base mb-1">Content Not Available</h3>
              <p className="text-xs sm:text-sm">This lesson does not have content configured yet.</p>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Section */}
      {renderAttachments()}
    </div>
  );
}
