import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  GraduationCap, 
  BookOpen, 
  Users, 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  Sparkles,
  Heart
} from "lucide-react";
import logo from "../assets/SHIKSHANALOGO.png";
// import saiLogo from "../assets/SAI_LOGO.png";
import saiLogo from "../assets/Shikshana.png";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

export default function Navbar() {
  const { user, logout, isStudent, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigateTimeoutRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  // Role-based navigation for dashboard - ✅ FIXED: Added setIsMenuOpen(false)
  const handleDashboard = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);  // ✅ CLOSES MOBILE MENU
    if (isTeacher) navigate("/teacher/dashboard");
    else if (isAdmin) navigate("/admin/dashboard");
    else navigate("/dashboard");
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);  // ✅ CLOSES MOBILE MENU
    try {
      await logout();
      toast.success("👋 You've been logged out successfully", {
        position: "top-center",
        autoClose: 2500,
        theme: "colored"
      });
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    }
  };

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    // Small delay to show the animation before navigating
    navigateTimeoutRef.current = setTimeout(() => {
      navigate(path);
    }, 300);
  };

  // Navigation items based on role
  const navItems = [
    { name: "Home", path: "/", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Catalog", path: "/catalog", icon: <BookOpen className="w-4 h-4" /> },
    ...(isStudent
      ? [
          { name: "Community", path: "/communities", icon: <Users className="w-4 h-4" /> },
          { name: "Wishlist", path: "/student/wishlist", icon: <Heart className="w-4 h-4" /> },
        ]
      : []),
  ];

  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <img
                src={saiLogo}
                alt="Shikshana AI"
                className="w-12 h-12 object-contain drop-shadow-sm"
              />
              <span>Shikshana AI</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-indigo-50/80 hover:text-indigo-700 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-200 hover:border-indigo-300 transition-all"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="font-bold text-indigo-700">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800 hidden sm:block">{user.name || 'User'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 py-2 z-50 overflow-hidden"
                    >
                      <div 
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 cursor-pointer flex items-center gap-2"
                        onClick={handleDashboard}
                      >
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        My Dashboard
                      </div>
{/*                       
                      <div 
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        My Profile
                      </div> */}
{/*                       
                      <div 
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/settings');
                        }}
                      >
                        <Settings className="w-4 h-4 text-indigo-600" />
                        Settings
                      </div> */}
                      
                      <div className="border-t border-gray-100 my-1" />
                      
                      <div 
                        className="px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/90 backdrop-blur-sm border-b border-white/30 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="py-4 space-y-1">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-indigo-50/80 hover:text-indigo-700 transition-all text-left"
                    >
                      {item.icon}
                      {item.name}
                    </button>
                  </motion.div>
                ))}
                
                <div className="border-t border-gray-100 my-3" />
                
                {user ? (
                  <div className="space-y-2">
                    {/* ✅ FIXED: handleDashboard now closes mobile menu */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDashboard}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-indigo-50/80 hover:text-indigo-700 transition-all"
                    >
                      <GraduationCap className="w-5 h-5" />
                      My Dashboard
                    </motion.button>
                    
                    {/* ✅ FIXED: handleLogout now closes mobile menu */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </motion.button>
                    
                    <div className="px-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 p-2 bg-indigo-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="font-bold text-indigo-700 text-lg">
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {/* ✅ Links unchanged - only setIsMenuOpen(false) in onClick */}
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
