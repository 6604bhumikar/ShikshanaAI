import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader,
  ShieldCheck,
  Clock,
  Mail,
  RefreshCw,
  Search,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = import.meta.env.VITE_API_ADMIN || "http://localhost:5000/api/admin";
const API = `${API_BASE}/communities`;

export default function AdminCommunityApproval() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("accessToken");
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchPending();
  }, []);

  /* =========================
     FETCH PENDING COMMUNITIES
  ========================= */
  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API}/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCommunities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load communities", err);
      const message = err?.response?.data?.message || "Failed to load pending communities. Please try again.";
      setError(message);
      toast.error(message, {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTER COMMUNITIES
  ========================= */
  const filteredCommunities = communities.filter(community => 
    community.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof community.teacher === 'object' 
      ? community.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.teacher?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      : community.teacher?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /* =========================
     APPROVE / REJECT WITH CONFIRMATION
  ========================= */
  const handleApprove = (community) => {
    setSelectedCommunity(community);
    setConfirmAction('approve');
  };

  const handleReject = (community) => {
    setSelectedCommunity(community);
    setConfirmAction('reject');
  };

  const executeAction = async () => {
    if (!selectedCommunity || !confirmAction) return;
    
    setActionLoading(true);
    
    try {
      if (confirmAction === 'approve') {
        await axios.post(
          `${API}/${selectedCommunity._id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success(`✅ "${selectedCommunity.title}" has been approved and is now live!`, {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
      } else {
        await axios.delete(
          `${API}/${selectedCommunity._id}/reject`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success(`🗑️ "${selectedCommunity.title}" has been rejected.`, {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
      }
      
      fetchPending();
      setConfirmAction(null);
      setSelectedCommunity(null);
    } catch (err) {
      console.error(`Failed to ${confirmAction} community`, err);
      const message = err?.response?.data?.message || 
        `Failed to ${confirmAction} community. Please try again.`;
      
      toast.error(message, {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
     SKELETON LOADER
  ========================= */
  const CommunitySkeleton = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-48 -left-48 w-[80rem] h-[80rem] bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-48 -right-48 w-[70rem] h-[70rem] bg-gradient-to-r from-amber-300 to-pink-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
                Community Moderation
              </h1>
              <p className="text-gray-600 mt-1">
                Review and approve community requests from instructors
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            <Button
              onClick={fetchPending}
              disabled={loading}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-colors"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <MessageSquare className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Communities</p>
                <p className="text-2xl font-bold text-gray-900">{filteredCommunities.length}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
              <span>Review within 48 hours</span>
            </div>
          </div>
        </motion.div>

        {/* Communities Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 mb-3 sm:mb-0">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Pending Communities</h2>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>{filteredCommunities.length} community{filteredCommunities.length !== 1 ? 's' : ''} awaiting review</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Community</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Teacher</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="p-0">
                        <CommunitySkeleton />
                      </td>
                    </tr>
                  ))
                ) : filteredCommunities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {searchTerm ? "No matching communities" : "No Pending Communities"}
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {searchTerm 
                          ? "Try adjusting your search terms to find what you're looking for."
                          : "All community requests have been reviewed. New submissions will appear here automatically."
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCommunities.map((community) => (
                    <motion.tr
                      key={community._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1.5 bg-indigo-100 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-indigo-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 line-clamp-1">{community.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                              {community.description?.substring(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-bold text-sm">
                              {typeof community.teacher === 'object' 
                                ? community.teacher?.name?.charAt(0) || 'T' 
                                : community.teacher?.charAt(0) || 'T'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {typeof community.teacher === 'object' 
                                ? community.teacher?.name || community.teacher?.email 
                                : community.teacher || "Teacher"}
                            </div>
                            {typeof community.teacher === 'object' && community.teacher?.email && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-xs">{community.teacher.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {new Date(community.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(community)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2"
                            aria-label="Approve community"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(community)}
                            className="bg-rose-600 hover:bg-rose-700 text-white p-2"
                            aria-label="Reject community"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && selectedCommunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setConfirmAction(null);
              setSelectedCommunity(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  confirmAction === 'approve' ? 'bg-emerald-100' : 'bg-rose-100'
                }`}>
                  {confirmAction === 'approve' ? (
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-600" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {confirmAction === 'approve' 
                    ? "Approve Community?" 
                    : "Reject Community?"}
                </h2>
                
                <p className="text-gray-600 mb-6 max-w-xs">
                  {confirmAction === 'approve' ? (
                    <>Are you sure you want to approve "<span className="font-medium">{selectedCommunity.title}</span>"? 
                    This community will become visible to all students.</>
                  ) : (
                    <>Are you sure you want to reject "<span className="font-medium">{selectedCommunity.title}</span>"? 
                    The instructor will be notified and can resubmit after making improvements.</>
                  )}
                </p>
                
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfirmAction(null);
                      setSelectedCommunity(null);
                    }}
                    className="flex-1 py-2.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={executeAction}
                    disabled={actionLoading}
                    className={`flex-1 py-2.5 ${
                      confirmAction === 'approve' 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-rose-600 hover:bg-rose-700'
                    } text-white`}
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      confirmAction === 'approve' ? "Approve Community" : "Reject Community"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Button Component
function Button({ children, className = "", variant = "default", size = "default", ...props }) {
  const baseStyles = "font-medium rounded-xl transition-all duration-300 flex items-center justify-center";
  
  const variants = {
    default: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg",
    outline: "border border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };
  
  const sizes = {
    default: "px-4 py-2 text-base",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
