import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  AlertCircle,
  Loader,
  ChevronRight,
  Sparkles,
  BookOpenText 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

export default function Register() {
  const navigate = useNavigate();
  const { user, loading: authLoading, register, getDashboardRoute, dashboardRouteFor } = useAuth();

  const [step, setStep] = useState('role'); // 'role' | 'form'
  const [selectedRole, setSelectedRole] = useState('');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form fields
  useEffect(() => {
    const isValid = 
      name.trim().length >= 2 && 
      email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && 
      password.length >= 6;
    setIsFormValid(isValid);
  }, [name, email, password]);

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('form');
    
    // Animate form entrance
    setTimeout(() => {
      document.getElementById('name')?.focus();
    }, 300);
  };

  // Handle back to role selection
  const handleBack = () => {
    setStep('role');
    setErrorMsg("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error("Please fill all fields correctly", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const registered = await register(name, email, password, selectedRole);
      
      // Show success toast before redirect
      toast.success(`Welcome to Shikshana, ${name.split(' ')[0]}! 🎉`, {
        position: "top-center",
        autoClose: 2500,
        theme: "colored"
      });
      
      // Redirect after toast animation
      setTimeout(() => {
        navigate(dashboardRouteFor(registered?.user), { replace: true });
      }, 2700);
    } catch (err) {
      console.error("Registration error:", err);
      const message = 
        err?.response?.data?.message || 
        err?.message || 
        "Registration failed. Please try again.";
      
      setErrorMsg(message);
      toast.error(message, {
        position: "top-center",
        autoClose: 4000,
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const roleCardVariants = {
    hover: { 
      scale: 1.03,
      y: -5,
      transition: { type: "spring", stiffness: 300 }
    },
    tap: { scale: 0.98 }
  };

  if (!authLoading && user) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Animated Background */}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          {/* Glassmorphism Card */}
          <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 -z-10"></div>
          
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8 md:p-10">
              {/* Header with Back Button */}
              <div className="flex items-center mb-8">
                {step === 'form' && (
                  <motion.button
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors mr-3"
                    aria-label="Back to role selection"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}
                <div className="flex-1 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`p-3 rounded-2xl mb-3 ${
                      step === 'role' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                        : selectedRole === 'student'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600'
                    }`}>
                      {step === 'role' ? (
                        <GraduationCap className="w-7 h-7 text-white" />
                      ) : selectedRole === 'student' ? (
                        <GraduationCap className="w-7 h-7 text-white" />
                      ) : (
                        <BookOpenText className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
                      {step === 'role' 
                        ? 'Create Your Account' 
                        : `Join as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                    </h1>
                    <p className="text-gray-600 mt-2 text-center max-w-xs">
                      {step === 'role'
                        ? 'Select your role to get started'
                        : `Start your ${selectedRole} journey with Shikshana`}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role Selection Step */}
              <AnimatePresence mode="wait">
                {step === 'role' ? (
                  <motion.div
                    key="role-step"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        variants={itemVariants}
                        whileHover={roleCardVariants.hover}
                        whileTap={roleCardVariants.tap}
                        onClick={() => handleRoleSelect('student')}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 bg-white/80 hover:bg-indigo-50 transition-all"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center mb-4">
                          <GraduationCap className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Student</h3>
                        <p className="text-center text-gray-600 text-sm">
                          Learn new skills, track progress, and earn certificates
                        </p>
                        <div className="mt-3 flex items-center text-emerald-600 font-medium text-sm">
                          Get Started
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </motion.button>
                      
                      <motion.button
                        variants={itemVariants}
                        whileHover={roleCardVariants.hover}
                        whileTap={roleCardVariants.tap}
                        onClick={() => handleRoleSelect('teacher')}
                        className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 bg-white/80 hover:bg-indigo-50 transition-all"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center mb-4">
                          {/* <ChalkboardTeacher className="w-7 h-7 text-amber-600" /> */}
                          <BookOpenText className="w-7 h-7 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Teacher</h3>
                        <p className="text-center text-gray-600 text-sm">
                          Create courses, manage students, and share your expertise
                        </p>
                        <div className="mt-3 flex items-center text-amber-600 font-medium text-sm">
                          Start Teaching
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </motion.button>
                    </div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className="text-center pt-4 border-t border-gray-100 mt-2"
                    >
                      <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link 
                          to="/login" 
                          className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* Registration Form Step */
                  <motion.div
                    key="form-step"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <motion.div variants={itemVariants}>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            autoComplete="name"
                            required
                          />
                        </div>
                      </motion.div>

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
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 flex justify-between">
                          <span>Password</span>
                          <span className="text-xs text-gray-500 font-normal">(min. 6 characters)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Button
                          type="submit"
                          disabled={loading || !isFormValid}
                          className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform ${
                            loading || !isFormValid
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : selectedRole === 'student'
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                              : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                          } hover:shadow-xl hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg`}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader className="w-5 h-5 animate-spin" />
                              Creating Account...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              Create Account
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                    
                    <motion.div 
                      variants={itemVariants}
                      className="text-center pt-4 border-t border-gray-100 mt-2"
                    >
                      <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link 
                          to="/login" 
                          className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
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
const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);
