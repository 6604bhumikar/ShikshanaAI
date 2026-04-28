import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  GraduationCap, 
  ArrowRight,
  Sparkles,
  Rocket
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from 'react-toastify';

export default function EnrollmentSuccess() {
  const navigate = useNavigate();
  const { id } = useParams(); // courseId
  const [countdown, setCountdown] = useState(3);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Enhanced confetti celebration
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
      
      confetti({
        ...defaults,
        particleCount: Math.floor(particleCount / 2),
        origin: { x: Math.random(), y: Math.random() + 0.2 }
      });
    }, 250);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/player/${id}`, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Success toast notification
    toast.success("✅ Enrollment successful! Redirecting to your course...", {
      position: "top-center",
      autoClose: 3500,
      theme: "colored",
      icon: ({ theme, type }) => <CheckCircle className="w-6 h-6" />
    });

    return () => {
      clearInterval(timer);
    };
  }, [navigate, id]);

  // Pause countdown on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
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
        
        {/* Floating Decorative Elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, Math.random() * 10 - 5, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className={`absolute ${
              i % 2 === 0 ? 'text-amber-300' : 'text-indigo-200'
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 1 + 0.5}rem`
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 -z-10"></div>
        
        <div 
          className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Progress Bar at Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ 
                duration: isHovered ? 0 : 3.5, 
                ease: "linear",
                delay: isHovered ? 0 : 0.5
              }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          </div>
          
          <div className="p-8 md:p-10 text-center">
            {/* Celebration Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                damping: 10, 
                stiffness: 100,
                delay: 0.2
              }}
              className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center mb-6 shadow-lg border-4 border-white"
            >
              <CheckCircle className="w-14 h-14 text-emerald-600" />
            </motion.div>
            
            {/* Header */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800 mb-3"
            >
              Enrollment Successful!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg max-w-md mx-auto mb-8"
            >
              🎓 Congratulations! You've unlocked your learning journey. 
              Your course is ready and waiting for you.
            </motion.p>
            
            {/* Course Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 mb-8 border border-indigo-100"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-indigo-700" />
                </div>
                <span className="font-bold text-gray-800">Your Course</span>
              </div>
              <p className="text-gray-600 italic">
                "The journey of a thousand miles begins with a single step."
              </p>
            </motion.div>
            
            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={() => navigate(`/player/${id}`)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-6 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Start Learning Now
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  variant="outline"
                  onClick={() => navigate("/catalog")}
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 py-6 text-lg font-medium rounded-2xl transition-all"
                >
                  Explore More Courses
                </Button>
              </motion.div>
            </div>
            
            {/* Countdown Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-gray-500 italic flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Redirecting to your course in {countdown} second{countdown !== 1 ? 's' : ''}...</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>
            
            {/* Decorative Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
          
          {/* Floating Elements Inside Card */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatePresence>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    y: [Math.random() * 100 - 50, -100, -200],
                    x: [Math.random() * 100 - 50, Math.random() * 50 - 25, Math.random() * 100 - 50]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  className="absolute text-amber-300"
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Component
const ShieldCheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);