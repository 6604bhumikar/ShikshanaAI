import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader,
  ChevronRight,
  Sparkles
} from "lucide-react";
import logo from "../../assets/SHIKSHANALOGO.png";
// import saiLogo from "../../assets/SAI_LOGO.png";
import saiLogo from "../../assets/Shikshana.png";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading: authLoading, login, dashboardRouteFor } = useAuth();
  const navigate = useNavigate();

  /* ===================== REDIRECT IF LOGGED IN ===================== */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={dashboardRouteFor(user)} replace />;
  }

  /* ===================== LOGIN SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const loggedIn = await login(email, password);

      if (!loggedIn?.accessToken || !loggedIn?.user) {
        throw new Error("Invalid login credentials");
      }

      localStorage.setItem("accessToken", loggedIn.accessToken);
      localStorage.setItem("user", JSON.stringify(loggedIn.user));

      // Show success toast before redirect
      toast.success(`Welcome back, ${loggedIn.user.name?.split(' ')[0] || 'learner'}!`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored"
      });

      // Redirect after toast animation
      setTimeout(() => {
        navigate(dashboardRouteFor(loggedIn.user), { replace: true });
      }, 2200);
    } catch (err) {
      console.error("Login error:", err);
      const message = err?.response?.data?.message || err.message || "Invalid email or password. Please try again.";
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

  /* ===================== ANIMATION VARIANTS ===================== */
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

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
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

      {/* LEFT SECTION - PLATFORM PREVIEW */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-800"
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-amber-200 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="absolute inset-6 border-2 border-white/20 rounded-2xl bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="h-10 bg-white/10 backdrop-blur-sm flex items-center px-4 gap-2 border-b border-white/10">
            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            <div className="ml-6 flex-1 text-center text-white/60 text-sm font-mono">
              shikshana.com/dashboard
            </div>
          </div>

          <div className="p-8 flex flex-col justify-between h-[calc(100%-2.5rem)]">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-[92px] h-[98px] rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <img
                  src={saiLogo}
                  alt="Shikshana AI"
                  className="w-18 h-18 object-contain drop-shadow-sm"
                />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Shikshana AI</h1>
                  <p className="text-indigo-200">Learning Management System</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Transform Your
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                    Learning Journey
                  </span>
                </h2>
                <p className="text-indigo-100 text-lg max-w-md mb-8">
                  Join thousands of students and educators who are achieving more with our intelligent, intuitive learning platform.
                </p>
                
                <div className="space-y-3">
                  {[
                    { icon: <GraduationCap className="w-5 h-5" />, text: "Personalized learning paths" },
                    { icon: <Sparkles className="w-5 h-5" />, text: "AI-powered recommendations" },
                    { icon: <Lock className="w-5 h-5" />, text: "Secure & reliable platform" }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3 text-white"
                    >
                      <div className="mt-1 p-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
                        {feature.icon}
                      </div>
                      <span>{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Floating UI Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Alex Morgan</p>
                    <p className="text-xs text-indigo-200">Data Science Student</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${
                        i === 1 ? 'bg-emerald-400' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span className="text-sm">Just completed "Machine Learning Fundamentals"</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-300"></div>
                  <span className="text-sm">Working on "Neural Networks Project"</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                  <span className="text-sm">Next lesson: "Deep Learning Applications"</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT SECTION - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="login-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="relative"
            >
              {/* Glassmorphism Card */}
              <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 -z-10"></div>
              
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 md:p-10">
                  {/* Logo & Header */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-col items-center mb-8"
                  >
                    <img
                      src={saiLogo}
                      alt="Shikshana AI"
                      className="w-20 h-20 object-contain drop-shadow-sm"
                    />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
                      Welcome Back
                    </h1>
                    <p className="text-gray-600 mt-2 text-center max-w-xs">
                      Sign in to continue your learning journey
                    </p>
                  </motion.div>

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

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        <Link 
                          to="/forgot" 
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          Forgot password?
                        </Link>
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
                          autoComplete="current-password"
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
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none disabled:hover:shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="w-5 h-5 animate-spin" />
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            Sign In
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Divider */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center my-6"
                  >
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <span className="mx-4 text-sm text-gray-500 font-medium">or continue with</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  </motion.div>

                  {/* Social Login */}
                  <motion.div 
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-3 mb-6"
                  >
                    <Button 
                      variant="outline" 
                      className="border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <GoogleIcon className="w-5 h-5 mr-2" />
                      Google
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <GithubIcon className="w-5 h-5 mr-2" />
                      GitHub
                    </Button>
                  </motion.div>

                  {/* Sign Up Link */}
                  <motion.div 
                    variants={itemVariants}
                    className="text-center pt-4 border-t border-gray-100"
                  >
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link 
                        to="/register" 
                        className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Create account
                      </Link>
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
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

const GoogleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);
