import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { studentAPI } from "@/lib/api";
import { 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader,
  SendHorizonal,
  GraduationCap
} from "lucide-react";

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);
  const navigate = useNavigate();

  /* =========================
     GET LOGGED-IN STUDENT ID
  ========================= */
  const token = localStorage.getItem("accessToken");
  const studentId = token
    ? JSON.parse(atob(token.split(".")[1]))?.id
    : null;

  useEffect(() => {
    loadCommunities();
  }, []);

  /* =========================
     LOAD COMMUNITIES
  ========================= */
  const loadCommunities = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.get("/communities");
      setCommunities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load communities failed", err);
      toast.error("Failed to load communities. Please try again.", { 
        autoClose: 3000,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     REQUEST JOIN (ENHANCED)
  ========================= */
  const requestJoin = async (communityId) => {
    if (joiningCommunityId === communityId) return;
    
    try {
      setJoiningCommunityId(communityId);
      await studentAPI.post(`/communities/${communityId}/join`);
      
      toast.success("✅ Join request sent! Waiting for teacher approval.", {
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
      
      await loadCommunities();
    } catch (err) {
      console.error("Join request failed:", err);
      
      const errorMsg = err.response?.data?.message?.trim();
      
      if (errorMsg?.toLowerCase() === "join request already sent") {
        toast.info("⏳ Join request already pending. Please wait for teacher approval.", {
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          theme: "colored",
          position: "top-center"
        });
        setJoiningCommunityId(null);
        return;
      }
      
      toast.error(errorMsg || "Failed to send join request. Please try again.", {
        autoClose: 4000,
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setJoiningCommunityId(null);
    }
  };

  /* =========================
     OPEN CHAT
  ========================= */
  const openChat = (communityId) => {
    navigate(`/communities/${communityId}`);
  };

  /* =========================
     SKELETON LOADER
  ========================= */
  const CommunitySkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Toast Container - Centered for better visibility */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Learning Communities
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mt-3">
            Connect with peers, share insights, and collaborate on your learning journey. 
            Join communities to discuss course content and get support from fellow students.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <CommunitySkeleton key={i} />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
              <MessageCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Communities Available</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              There are no active learning communities for your courses yet. 
              Check back later or contact your instructor to create one.
            </p>
            <button
              onClick={() => navigate('/catalog')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
              <GraduationCap className="w-5 h-5" />
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {communities.map((c) => {
              const isMember = c.members?.some(
                (id) => id?.toString() === studentId?.toString()
              );
              const hasPendingRequest = c.pendingRequests?.some(
                (id) => id?.toString() === studentId?.toString()
              );

              return (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Community Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 p-2 bg-indigo-50 rounded-xl">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-gray-900 truncate">
                              {c.title || "Community"}
                            </h2>
                            {isMember && (
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Member
                              </span>
                            )}
                            {hasPendingRequest && !isMember && (
                              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {c.description || "A community for course discussions and collaboration."}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{c.memberCount || 0} members</span>
                            </div>
                            {c.teacher && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>{c.teacher.name || "Instructor"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-end min-w-max">
                      {isMember ? (
                        <button
                          onClick={() => openChat(c._id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all min-w-[120px]"
                          aria-label={`Open chat for ${c.title}`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden xs:inline">Open Chat</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => requestJoin(c._id)}
                          disabled={joiningCommunityId === c._id || hasPendingRequest}
                          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium min-w-[120px] transition-all ${
                            joiningCommunityId === c._id || hasPendingRequest
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg"
                          }`}
                          aria-label={hasPendingRequest ? "Join request pending" : `Join ${c.title}`}
                        >
                          {joiningCommunityId === c._id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Joining...</span>
                            </>
                          ) : hasPendingRequest ? (
                            <>
                              <Clock className="w-4 h-4" />
                              <span>Pending</span>
                            </>
                          ) : (
                            <>
                              <SendHorizonal className="w-4 h-4" />
                              <span className="hidden xs:inline">Join</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
