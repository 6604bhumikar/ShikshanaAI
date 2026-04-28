import React, { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Trash,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Mail,
  GraduationCap,
  Lock,
  Unlock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import adminAPI from "@/lib/adminApi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchInputRef = useRef(null);

  /* ======================
     LOAD USERS
  ====================== */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await adminAPI.get("/users");
      setUsers(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Failed to load users. Please try again.");
      toast.error("Unable to load user data. Please try again.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ======================
     FILTER AND PAGINATE USERS
  ====================== */
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = 
        selectedRole === "all" || 
        user.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  /* ======================
     ACTIONS WITH CONFIRMATION
  ====================== */
  const handleAction = (action, user) => {
    setSelectedUser(user);
    setConfirmAction(action);
  };

  const executeAction = async () => {
    if (!confirmAction || !selectedUser) return;
    
    setActionLoading(true);
    
    try {
      switch (confirmAction) {
        case 'block':
          await adminAPI.patch(`/users/${selectedUser._id}/status`, {
            isBlocked: !selectedUser.isBlocked,
          });
          toast.success(
            selectedUser.isBlocked 
              ? `✅ ${selectedUser.name || 'User'} has been activated!` 
              : `⚠️ ${selectedUser.name || 'User'} has been blocked.`,
            { position: "top-center", autoClose: 3000, theme: "colored" }
          );
          break;
          
        case 'verify':
          await adminAPI.patch(`/users/${selectedUser._id}/verify`);
          toast.success(`✅ ${selectedUser.name || 'Teacher'} verified successfully!`, {
            position: "top-center",
            autoClose: 3000,
            theme: "colored"
          });
          break;
          
        case 'delete':
          await adminAPI.patch(`/users/${selectedUser._id}/delete`);
          toast.success(`🗑️ ${selectedUser.name || 'User'} deleted successfully!`, {
            position: "top-center",
            autoClose: 3000,
            theme: "colored"
          });
          break;
          
        default:
          throw new Error("Invalid action");
      }
      
      loadUsers();
      setConfirmAction(null);
      setSelectedUser(null);
    } catch (err) {
      console.error("Action failed", err);
      toast.error(
        err?.response?.data?.message || 
        `Failed to ${confirmAction} user. Please try again.`,
        { position: "top-center", autoClose: 4000, theme: "colored" }
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ======================
     STATS CALCULATION
  ====================== */
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const blocked = users.filter(u => u.isBlocked).length;
    
    return { total, students, teachers, admins, blocked };
  }, [users]);

  /* ======================
     SKELETON LOADER
  ====================== */
  const UserSkeleton = () => (
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
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage students, teachers, and administrators on your platform
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Administrators</option>
            </select>
            
            <Button
              onClick={loadUsers}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "indigo" },
            { label: "Students", value: stats.students, icon: GraduationCap, color: "blue" },
            { label: "Teachers", value: stats.teachers, icon: User, color: "emerald" },
            { label: "Admins", value: stats.admins, icon: ShieldCheck, color: "purple" },
            { label: "Blocked", value: stats.blocked, icon: Lock, color: "rose" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5 shadow-sm hover:shadow-md transition-all ${
                stat.color === 'indigo' && 'border-indigo-100'
              } ${
                stat.color === 'blue' && 'border-blue-100'
              } ${
                stat.color === 'emerald' && 'border-emerald-100'
              } ${
                stat.color === 'purple' && 'border-purple-100'
              } ${
                stat.color === 'rose' && 'border-rose-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  stat.color === 'indigo' && 'bg-indigo-50'
                } ${
                  stat.color === 'blue' && 'bg-blue-50'
                } ${
                  stat.color === 'emerald' && 'bg-emerald-50'
                } ${
                  stat.color === 'purple' && 'bg-purple-50'
                } ${
                  stat.color === 'rose' && 'bg-rose-50'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'indigo' && 'text-indigo-600'
                  } ${
                    stat.color === 'blue' && 'text-blue-600'
                  } ${
                    stat.color === 'emerald' && 'text-emerald-600'
                  } ${
                    stat.color === 'purple' && 'text-purple-600'
                  } ${
                    stat.color === 'rose' && 'text-rose-600'
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 mb-3 sm:mb-0">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">User Directory</h2>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
                <span className="font-medium">{filteredUsers.length}</span> users
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="p-0">
                        <UserSkeleton />
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {searchTerm || selectedRole !== "all" 
                          ? "Try adjusting your search filters to find what you're looking for."
                          : "No users have been registered on the platform yet."
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="hover:bg-indigo-50/50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.role === 'student' ? 'bg-blue-100' :
                            user.role === 'teacher' ? 'bg-emerald-100' : 'bg-purple-100'
                          }`}>
                            <User className={`w-5 h-5 ${
                              user.role === 'student' ? 'text-blue-700' :
                              user.role === 'teacher' ? 'text-emerald-700' : 'text-purple-700'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900">{user.name || user.fullName || "User"}</div>
                            <div className="text-sm text-gray-500 hidden md:block">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate max-w-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <Badge className={`${
                          user.role === "teacher"
                            ? "bg-emerald-100 text-emerald-800"
                            : user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        } px-3 py-1 rounded-full font-medium capitalize`}>
                          {user.role}
                        </Badge>
                        {user.role === "teacher" && user.isVerified && (
                          <Badge className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <Badge className={`${
                          user.isBlocked
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        } px-3 py-1 rounded-full font-medium flex items-center gap-1`}>
                          {user.isBlocked ? (
                            <>
                              <Lock className="w-3 h-3" />
                              Blocked
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              Active
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(user.isBlocked ? 'block' : 'block', user)}
                            className={`${
                              user.isBlocked 
                                ? "bg-emerald-600 hover:bg-emerald-700" 
                                : "bg-rose-600 hover:bg-rose-700"
                            } text-white p-2`}
                            aria-label={user.isBlocked ? "Activate user" : "Block user"}
                          >
                            {user.isBlocked ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </Button>
                          
                          {user.role === "teacher" && !user.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => handleAction('verify', user)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2"
                              aria-label="Verify teacher"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            onClick={() => handleAction('delete', user)}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-2"
                            aria-label="Delete user"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-gray-200 p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (pageNumber === 1 || pageNumber === totalPages || 
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                      return (
                        <Button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          className={`w-8 h-8 p-0 text-sm ${
                            currentPage === pageNumber 
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                              : "border-gray-200"
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    }
                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return <span key={`ellipsis-${pageNumber}`} className="px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="border-gray-200 p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setConfirmAction(null);
              setSelectedUser(null);
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
                  confirmAction === 'block' ? (selectedUser.isBlocked ? 'bg-emerald-100' : 'bg-rose-100') :
                  confirmAction === 'verify' ? 'bg-indigo-100' :
                  'bg-rose-100'
                }`}>
                  {confirmAction === 'block' ? (
                    selectedUser.isBlocked ? (
                      <UserCheck className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <UserX className="w-8 h-8 text-rose-600" />
                    )
                  ) : confirmAction === 'verify' ? (
                    <ShieldCheck className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <Trash className="w-8 h-8 text-rose-600" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {confirmAction === 'block' ? (
                    selectedUser.isBlocked ? "Activate User?" : "Block User?"
                  ) : confirmAction === 'verify' ? (
                    "Verify Teacher?"
                  ) : (
                    "Delete User?"
                  )}
                </h2>
                
                <p className="text-gray-600 mb-6 max-w-xs">
                  {confirmAction === 'block' ? (
                    selectedUser.isBlocked ? (
                      `Are you sure you want to activate ${selectedUser.name || 'this user'}? They will regain access to the platform.`
                    ) : (
                      `Are you sure you want to block ${selectedUser.name || 'this user'}? They will lose access to the platform.`
                    )
                  ) : confirmAction === 'verify' ? (
                    `Are you sure you want to verify ${selectedUser.name || 'this teacher'}? This will grant them full teaching privileges.`
                  ) : (
                    `Are you sure you want to permanently delete ${selectedUser.name || 'this user'}? This action cannot be undone.`
                  )}
                </p>
                
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfirmAction(null);
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-2.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={executeAction}
                    disabled={actionLoading}
                    className={`flex-1 py-2.5 ${
                      confirmAction === 'block' ? (
                        selectedUser.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                      ) : confirmAction === 'verify' ? (
                        'bg-indigo-600 hover:bg-indigo-700'
                      ) : (
                        'bg-rose-600 hover:bg-rose-700'
                      )
                    } text-white`}
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      confirmAction === 'block' ? (
                        selectedUser.isBlocked ? "Activate User" : "Block User"
                      ) : confirmAction === 'verify' ? (
                        "Verify Teacher"
                      ) : (
                        "Delete User"
                      )
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