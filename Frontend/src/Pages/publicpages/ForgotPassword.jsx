import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  Loader,
  Lock,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_AUTH || "http://localhost:5000/api/auth";
      
      await axios.post(`${API_BASE}/forgot-password`, {
        email: email.trim()
      });

      setIsSubmitted(true);
      toast.success("✅ Password reset link sent successfully!", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
      
      // Clear email after successful submission
      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      const message = 
        err?.response?.data?.message || 
        err?.message || 
        "Failed to send reset link. Please try again.";
      
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
                      Forgot Password?
                    </h1>
                    <p className="text-gray-600 mt-2 text-center max-w-xs">
                      {isSubmitted 
                        ? "Check your inbox for reset instructions" 
                        : "Enter your email to receive a password reset link"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Success State */}
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-8"
                  >
                    <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Sent!</h2>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      We've sent a password reset link to{" "}
                      <span className="font-medium text-indigo-700 break-all">{email}</span>
                      <br /><br />
                      Please check your inbox (and spam folder) within the next hour. 
                      The link will expire after 60 minutes for security.
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={() => navigate("/login")}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setEmail("");
                        }}
                        className="w-full text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      >
                        Send Another Reset Link
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Form State */
                  <motion.div
                    key="form-state"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-400" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            autoComplete="email"
                            required
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Enter the email address associated with your Shikshana account
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button
                          type="submit"
                          disabled={loading || !email.trim()}
                          className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform ${
                            loading || !email.trim()
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                          } hover:shadow-xl hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg`}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader className="w-5 h-5 animate-spin" />
                              Sending Reset Link...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              Send Reset Link
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
                        <ShieldCheckIcon className="w-4 h-4 text-indigo-600" />
                        <span>Secure password recovery</span>
                      </div>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        For security reasons, reset links expire after 60 minutes. 
                        If you don't receive an email, check your spam folder or try again.
                      </p>
                    </motion.div>

                    {/* Back to Login */}
                    <motion.div 
                      variants={itemVariants}
                      className="text-center mt-6"
                    >
                      <button
                        onClick={() => navigate("/login")}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1 mx-auto"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Icon Components
const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);