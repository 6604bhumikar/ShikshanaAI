import { useEffect, useState } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const { token } = useParams(); // reset token from URL
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email"); // email from URL query
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isValidEmail, setIsValidEmail] = useState(true);

  // Validate email format on mount
  useEffect(() => {
    if (!email || !token) {
      toast.error("Invalid or expired reset link. Please request a new password reset.", {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
      setIsValidEmail(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format in reset link.", {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
      setIsValidEmail(false);
    }
  }, [email, token]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please check and try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    if (passwordStrength < 50) {
      toast.warn("Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.", {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_AUTH || "http://localhost:5000/api/auth";
      
      await axios.post(`${API_BASE}/reset-password`, {
        email,
        token,
        password
      });

      toast.success("✅ Password updated successfully! Redirecting to login...", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3200);
    } catch (err) {
      console.error("Reset password error:", err);
      const message = 
        err?.response?.data?.message || 
        err?.message || 
        "Failed to reset password. The link may have expired.";
      
      toast.error(message, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  if (!isValidEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired. Please request a new reset link from the login page.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <div className="relative">
          {/* Glassmorphism Card */}
          <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 -z-10"></div>
          
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8 md:p-10">
              {/* Header */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center mb-8"
              >
                <button
                  onClick={() => navigate("/login")}
                  className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors mr-3"
                  aria-label="Back to login"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4">
                      <Lock className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
                      Reset Your Password
                    </h1>
                    <p className="text-gray-600 mt-2 text-center max-w-xs">
                      Create a new secure password for your account
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Email Display */}
              <motion.div 
                variants={itemVariants}
                className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-indigo-100 rounded-lg">
                    <MailIcon className="w-4 h-4 text-indigo-700" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-700 font-medium mb-1">Resetting password for:</p>
                    <p className="font-medium text-gray-800 break-all">{email}</p>
                  </div>
                </div>
              </motion.div>

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 flex justify-between items-center">
                    <span>New Password</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength < 30 ? 'text-rose-500' :
                      passwordStrength < 60 ? 'text-amber-500' : 'text-emerald-600'
                    }`}>
                      {passwordStrength === 0 ? 'Weak' :
                       passwordStrength < 50 ? 'Medium' : 'Strong'}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${
                        passwordStrength < 30 ? 'bg-rose-500' :
                        passwordStrength < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Use 8+ characters with a mix of letters, numbers & symbols
                  </p>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="mt-2 flex items-center text-sm">
                      {password === confirmPassword ? (
                        <div className="flex items-center text-emerald-600">
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          <span>Passwords match</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-600">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          <span>Passwords do not match</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={loading || passwordStrength < 50 || password !== confirmPassword}
                    className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform ${
                      loading || passwordStrength < 50 || password !== confirmPassword
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                    } hover:shadow-xl hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Updating Password...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Update Password
                        <ArrowRightIcon className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Security Note */}
              <motion.div 
                variants={itemVariants}
                className="mt-8 pt-6 border-t border-gray-100 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Your password is encrypted and secure</span>
                </div>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  For security reasons, this reset link will expire in 1 hour. If you didn't request this change, please contact support immediately.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Icon Components
const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);