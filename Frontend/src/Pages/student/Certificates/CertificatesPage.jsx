import React, { useEffect, useState } from "react";
import axios from "axios";
import CertificateCard from "./CertificateCard";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Award, 
  Trophy, 
  AlertCircle, 
  Loader,
  FileText,
  Sparkles
} from "lucide-react";
import { toast } from 'react-toastify';

export default function CertificatesPage() {
  const API_BASE = import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }
    loadCertificates();
  }, [accessToken, navigate]);

  /* =========================
     LOAD CERTIFICATES
  ========================= */
  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API_BASE}/certificates`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Handle different API response structures robustly
      const certsData = Array.isArray(res.data) 
        ? res.data 
        : res.data?.certificates || res.data?.data || [];
        
      setCertificates(certsData);
    } catch (err) {
      console.error("Certificate Load Error:", err);
      
      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }
      
      const errorMsg = err.response?.data?.message || "Failed to load certificates. Please try again.";
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

  /* =========================
     DOWNLOAD CERTIFICATE
  ========================= */
  const downloadCertificate = async (certId) => {
    try {
      const cert = certificates.find((c) => c._id === certId);
      if (!cert) throw new Error("Certificate not found");
      
      const courseTitle = 
        cert?.course?.title || 
        cert?.courseTitle || 
        "Course Certificate";

      const res = await axios.get(
        `${API_BASE}/certificates/${certId}/download`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = url;
      link.download = `${courseTitle.replace(/\s+/g, "_")}_Certificate_${new Date().toISOString().slice(0,10)}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      // Success feedback handled in CertificateCard
    } catch (err) {
      console.error("Download Error:", err);
      throw new Error(err.response?.data?.message || "Failed to download certificate. Please try again.");
    }
  };

  /* =========================
     SKELETON LOADER
  ========================= */
  const CertificateSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-1.5 bg-gray-200"></div>
      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  /* =========================
     RENDER
  ========================= */
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificates Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadCertificates}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Loader className="w-5 h-5 animate-spin" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            My Certificates
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mt-3">
            Celebrate your achievements! Download and share your official certificates of completion.
          </p>
        </div>

        {/* Summary Section */}
        {!loading && certificates.length > 0 && (
          <div className="mb-10 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'} Earned
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Keep up the great work! Each certificate represents your dedication and growth.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/my-learning')}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Continue Learning
                </button>
                <button
                  onClick={() => navigate('/catalog')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 font-medium shadow transition-all"
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Earn More
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <CertificateSkeleton key={i} />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
              <Award className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Complete your first course to earn an official certificate of completion. 
              Your achievements deserve recognition!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/catalog')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                Browse Courses
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
          <div className="space-y-5">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert._id || cert.id}
                certificate={cert}
                onDownload={downloadCertificate}
              />
            ))}
            
            {/* Achievement Footer */}
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white p-2 rounded-full shadow-md">
                  <Award className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Keep Achieving Great Things!
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every certificate represents knowledge gained and skills mastered. 
                Share your achievements with your network and inspire others!
              </p>
              <div className="mt-4 flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => window.open('https://linkedin.com', '_blank')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => window.open('https://twitter.com', '_blank')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Share on Twitter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
