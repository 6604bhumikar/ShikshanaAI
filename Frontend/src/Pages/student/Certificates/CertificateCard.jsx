import React, { useState } from "react";
import { 
  Award, 
  Download, 
  Loader,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from 'react-toastify';

export default function CertificateCard({ certificate, onDownload }) {
  if (!certificate) return null;

  // ✅ Handle multiple possible data structures robustly
  const courseTitle = 
    certificate?.course?.title ||
    certificate?.course?.name ||
    certificate?.courseTitle ||
    certificate?.courseName ||
    certificate?.title ||
    "Course Certificate";

  const issuedDate = 
    certificate?.issuedAt ||
    certificate?.createdAt ||
    certificate?.completedAt ||
    certificate?.date;

  const certificateId = 
    certificate?.certificateId ||
    certificate?.serialNumber ||
    certificate?._id?.slice(-8).toUpperCase();

  const [isDownloading, setIsDownloading] = useState(false);

  // Format date with fallback
  const formattedDate = issuedDate 
    ? new Date(issuedDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "Date unavailable";

  // Handle download with feedback
  const handleDownload = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      // Show initiating message
      toast.info("Preparing your certificate...", {
        autoClose: 2000,
        position: "top-center",
        theme: "colored"
      });
      
      await onDownload(certificate._id || certificate.id);
      
      // Show success message
      toast.success("✅ Certificate downloaded successfully!", {
        autoClose: 3000,
        position: "top-center",
        theme: "colored"
      });
    } catch (error) {
      console.error("Download certificate error:", error);
      toast.error(error?.message || "Failed to download certificate. Please try again.", {
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      
      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Certificate Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Icon Container */}
          <div className="flex-shrink-0 p-3 bg-indigo-50 rounded-xl mt-1">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {courseTitle}
              </h3>
              {certificateId && (
                <span className="flex-shrink-0 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  ID: {certificateId}
                </span>
              )}
            </div>
            
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Official Certificate of Completion</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">Issued on: {formattedDate}</span>
              </div>
              
              {certificate.verified && (
                <div className="flex items-center gap-1.5 mt-1 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-800">Verified Credential</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex-shrink-0 pt-2 sm:pt-0">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow ${
              isDownloading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg"
            }`}
            aria-label={`Download certificate for ${courseTitle}`}
          >
            {isDownloading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}