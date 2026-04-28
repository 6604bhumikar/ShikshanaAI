import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Home, 
  BookOpen, 
  AlertCircle,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import confetti from "canvas-confetti";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    // Subtle confetti to turn negative into positive
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b']
    });
  }, []);

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
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              x: [0, Math.random() * 30 - 15, 0],
              rotate: [0, Math.random() * 8 - 4, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
            className={`absolute ${
              i % 2 === 0 ? 'text-indigo-200' : 'text-purple-200'
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 1 + 0.5}rem`
            }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 -z-10"></div>
        
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10 text-center">
            {/* Decorative Header */}
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            
            {/* 404 Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                damping: 10, 
                stiffness: 100,
                delay: 0.2
              }}
              className="mb-6"
            >
              <h1 className="text-[6rem] md:text-[8rem] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700 tracking-tight leading-none">
                404
              </h1>
            </motion.div>
            
            {/* Message */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
            >
              Lost in Learning Space?
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg max-w-md mx-auto mb-8"
            >
              The page you're looking for seems to have taken a detour. 
              Don't worry—every great learning journey has a few unexpected turns!
            </motion.p>
            
            {/* Illustration */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 flex items-center justify-center">
                  <Search className="w-12 h-12 text-indigo-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-100 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </motion.div>
            
            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-6 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Home className="w-5 h-5" />
                    Return to Homepage
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
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Explore Our Courses
                  </div>
                </Button>
              </motion.div>
            </div>
            
            {/* Helpful Tip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-indigo-50 rounded-xl p-4 border border-indigo-100"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-indigo-100 rounded-lg">
                  <ArrowLeft className="w-4 h-4 text-indigo-700" />
                </div>
                <p className="text-sm text-indigo-800 font-medium">
                  Tip: You can also use the navigation menu to find your way back to familiar territory.
                </p>
              </div>
            </motion.div>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Shikshana LMS. All rights reserved.
              </p>
            </div>
          </div>
          
          {/* Decorative Elements Inside Card */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200 to-pink-200 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
        </div>
      </motion.div>
    </div>
  );
}