import React, { useState } from "react";
import { 
  Calendar, 
  CreditCard, 
  ExternalLink, 
  Download,
  FileText,
  Loader,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const FALLBACK_THUMBNAIL = 
  import.meta.env.VITE_FALLBACK_THUMBNAIL || 
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200' viewBox='0 0 320 200'%3E%3Crect width='320' height='200' fill='%23eef2ff'/%3E%3Cpath d='M85 68h150v96H85z' fill='%23fff' stroke='%23818cf8' stroke-width='4'/%3E%3Cpath d='M105 92h110M105 116h85M105 140h62' stroke='%234f46e5' stroke-width='10' stroke-linecap='round'/%3E%3C/svg%3E";

export default function OrderCard({ order }) {
  const [loadingView, setLoadingView] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [error, setError] = useState(null);

  const course = order?.course || {};
  const date = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : "N/A";

  const thumbnail = 
    (course?.thumbnail && course.thumbnail.trim() !== "") 
      ? course.thumbnail 
      : FALLBACK_THUMBNAIL;

  const API_STUDENT = 
    import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";

  // Format amount with Indian numbering system
  const formatAmount = (amount) => {
    if (!amount) return "₹0";
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  /* =============================
     👁️ VIEW INVOICE (HTML)
  ============================== */
  const viewInvoice = async () => {
    try {
      setLoadingView(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch(
        `${API_STUDENT}/orders/${order._id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab with proper cleanup
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }
      
      // Cleanup URL object after delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        setLoadingView(false);
      }, 3000);
    } catch (error) {
      console.error("View invoice error:", error);
      setError(error.message || "Unable to open invoice. Please try again.");
      setLoadingView(false);
    }
  };

  /* =============================
     ⬇️ DOWNLOAD INVOICE (PDF)
  ============================== */
  const downloadInvoice = async () => {
    try {
      setLoadingDownload(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch(
        `${API_STUDENT}/orders/${order._id}/invoice/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `Invoice_${order.invoiceNumber || order._id}.pdf`;

      // Create and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setLoadingDownload(false);
        
        // Show success feedback
        setError("✅ Invoice downloaded successfully!");
        setTimeout(() => setError(null), 3000);
      }, 100);
    } catch (error) {
      console.error("Download invoice error:", error);
      setError(error.message || "Unable to download invoice. Please try again.");
      setLoadingDownload(false);
    }
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.src = FALLBACK_THUMBNAIL;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Card Header - Status Badge */}
      {order.status && (
        <div className={`h-1.5 ${
          order.status === 'paid' ? 'bg-emerald-500' :
          order.status === 'pending' ? 'bg-amber-500' :
          'bg-gray-400'
        }`}></div>
      )}

      <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
        {/* Course Thumbnail */}
        <div className="flex-shrink-0 w-28 h-20 md:w-32 md:h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          <img
            src={thumbnail}
            alt={course?.title || "Course thumbnail"}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        </div>

        {/* Course Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-1">
                {course?.title || "Untitled Course"}
              </h2>
              
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Purchased: {date}</span>
                </div>
                
                {order.invoiceNumber && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Invoice: {order.invoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Amount Display */}
            <div className="mt-2 sm:mt-0 flex-shrink-0 text-right">
              <div className="flex items-center justify-end gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  {formatAmount(order.amount)}
                </span>
              </div>
              
              {order.paymentMethod && (
                <div className="mt-1 text-xs text-gray-500">
                  via {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-5 md:px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Status Badge */}
          {order.status && (
            <div className="flex items-center gap-2">
              {order.status === 'paid' ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Paid</span>
                </div>
              ) : order.status === 'pending' ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span>Pending</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Button */}
            <button
              onClick={viewInvoice}
              disabled={loadingView}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                loadingView
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              }`}
              aria-label="View invoice"
            >
              {loadingView ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  View Invoice
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={downloadInvoice}
              disabled={loadingDownload}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                loadingDownload
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
              aria-label="Download invoice"
            >
              {loadingDownload ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Error/Success Message */}
        {error && (
          <div className={`mt-3 p-2.5 rounded-lg flex items-center gap-2 text-sm ${
            error.startsWith('✅') 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {error.startsWith('✅') ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
