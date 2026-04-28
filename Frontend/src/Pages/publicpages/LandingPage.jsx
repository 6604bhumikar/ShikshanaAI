import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Star,
  Play,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Brain,
  Lightbulb,
  Target,
  CheckCircle,
  Quote,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
  Building2
} from "lucide-react";
import saiLogo from "../../assets/Shikshana.png";

// --- Data Moved Outside to prevent re-creation on render ---
const features = [
  {
    icon: <Brain className="w-12 h-12 text-indigo-400" />,
    title: "AI-Powered Learning",
    description: "Personalized learning paths adapt to your pace and style. Our AI recommends content based on your progress and goals.",
    gradient: "from-indigo-500 to-purple-600",
    stats: [
      { value: "92%", label: "Completion Rate" },
      { value: "4.8x", label: "Faster Learning" }
    ]
  },
  {
    icon: <Zap className="w-12 h-12 text-amber-400" />,
    title: "Seamless Course Creation",
    description: "Create engaging courses in minutes with our intuitive builder. Add videos, quizzes, assignments, and interactive content effortlessly.",
    gradient: "from-amber-500 to-orange-600",
    stats: [
      { value: "15 min", label: "Avg. Course Setup" },
      { value: "98%", label: "Teacher Satisfaction" }
    ]
  },
  {
    icon: <ShieldCheck className="w-12 h-12 text-emerald-400" />,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with regular backups and 99.9% uptime. Your data and content are always protected and accessible.",
    gradient: "from-emerald-500 to-teal-600",
    stats: [
      { value: "99.9%", label: "Uptime Guarantee" },
      { value: "24/7", label: "Support Team" }
    ]
  },
  {
    icon: <TrendingUp className="w-12 h-12 text-rose-400" />,
    title: "Analytics Dashboard",
    description: "Track performance with real-time insights. Monitor engagement, completion rates, and revenue with beautiful visual reports.",
    gradient: "from-rose-500 to-pink-600",
    stats: [
      { value: "50+", label: "Metrics Tracked" },
      { value: "Real-time", label: "Data Updates" }
    ]
  }
];

const testimonials = [
  {
    name: "Dr. Ananya Sharma",
    role: "Computer Science Professor",
    institution: "IIT Bangalore",
    content: "Shikshana transformed how I deliver courses. The analytics help me identify struggling students early, and the engagement tools keep everyone motivated.",
    avatar: "https://i.pravatar.cc/150?img=32"
  },
  {
    name: "Rajiv Mehta",
    role: "Senior Developer",
    institution: "Microsoft India",
    content: "As a working professional, I needed flexible learning. Shikshana's mobile app and offline access let me learn during my commute. The certificates are industry-recognized!",
    avatar: "https://i.pravatar.cc/150?img=65"
  },
  {
    name: "Priya Nair",
    role: "Course Creator",
    institution: "Digital Educators India",
    content: "I've created 12 courses on Shikshana and reached over 15,000 students. The revenue share model is fair, and the support team is incredibly responsive.",
    avatar: "https://i.pravatar.cc/150?img=41"
  }
];

const stats = [
  { value: "50K+", label: "Active Students" },
  { value: "2K+", label: "Courses Available" },
  { value: "15K+", label: "Certified Graduates" },
  { value: "98%", label: "Satisfaction Rate" }
];

// --- Sub-Components for Performance ---

const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className="space-y-4 sm:space-y-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: "some", margin: "-50px" }}
            transition={{ 
              delay: prefersReducedMotion ? 0 : index * 0.1, 
              duration: prefersReducedMotion ? 0.3 : 0.5,
              type: "tween",
              ease: "easeOut"
            }}
            className={`relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/20 bg-white/50 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 transform-gpu ${
              activeFeature === index ? 'ring-2 ring-indigo-500/50 scale-[1.02]' : ''
            }`}
            onMouseEnter={() => setActiveFeature(index)}
            layout
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-10`} />
            
            <div className="relative z-10 flex items-start">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm flex-shrink-0">
                {feature.icon}
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{feature.description}</p>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {feature.stats.map((stat, i) => (
                    <div key={i} className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-xl">
                      <div className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: "some" }}
        transition={{ duration: prefersReducedMotion ? 0.3 : 0.6, ease: "easeOut" }}
        className="relative hidden md:block"
      >
        {/* Feature Visual Card - Simplified for performance */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-1 shadow-2xl border border-white/30 overflow-hidden transform-gpu">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">Course Dashboard</p>
                  <p className="text-lg font-bold text-gray-800 truncate">Data Science Masterclass</p>
                </div>
              </div>
              <div className="flex items-center text-amber-400 flex-shrink-0">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1 text-gray-700 font-medium text-sm">4.9 (1.2K)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 sm:p-5 border border-indigo-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Students Enrolled</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">12,450</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Completion Rate</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">92%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 text-sm">120+ video lessons with lifetime access</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Industry-recognized certificate</span>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Next Live Session</p>
                <p className="font-bold text-indigo-700 text-sm sm:text-base">Tomorrow at 6:00 PM IST</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base"
                size="sm"
              >
                Join Session
              </Button>
            </div>
          </div>
        </div>
        
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 4, 
            repeat: prefersReducedMotion ? 0 : Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-6 -right-6 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 sm:p-3 flex flex-col items-center justify-center transform-gpu"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center mb-1 sm:mb-2">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-center leading-tight">AI Study Buddy</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Button Component - Defined early to avoid hoisting issues
function Button({ children, className = "", variant = "default", size = "default", ...props }) {
  const baseStyles = "font-medium rounded-xl transition-all duration-300 flex items-center justify-center transform-gpu";
  
  const variants = {
    default: "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl",
    outline: "border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
  };
  
  const sizes = {
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    sm: "px-4 py-2 text-sm"
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

function SearchIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50/30 to-white overflow-x-hidden touch-action-manipulation">
      {/* Animated Background Elements - OPTIMIZED */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={prefersReducedMotion ? {} : { 
            x: [0, 30, 0], 
            y: [0, -30, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 20,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-48 -left-48 w-[60rem] h-[60rem] bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full blur-3xl transform-gpu"
        />
        <motion.div 
          animate={prefersReducedMotion ? {} : { 
            x: [0, -20, 0],
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 25,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut",
            delay: prefersReducedMotion ? 0 : 2
          }}
          className="absolute -bottom-48 -right-48 w-[50rem] h-[50rem] bg-gradient-to-r from-amber-300 to-pink-300 rounded-full blur-3xl transform-gpu"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(255,255,255,0.8)_100%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden z-10">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 font-medium mb-4 sm:mb-6 text-sm sm:text-base"
          >
            <Star className="w-4 h-4 inline mr-1" />
            Trusted by 50,000+ learners worldwide
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.1, duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 leading-tight"
          >
            Transform Education with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
              Intelligent Learning
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-10 px-2"
          >
            The all-in-one platform for students, educators, and institutions to create, deliver, and experience exceptional learning journeys.
          </motion.p>
          
          {/* Search Bar - Fixed mobile compression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.3, duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="max-w-3xl mx-auto mb-8 sm:mb-12 px-2"
          >
            <div className="relative w-full">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-md rounded-full border border-white/20 shadow-lg" />
              <div className="relative flex items-center bg-white/90 backdrop-blur-sm rounded-full overflow-hidden border border-gray-200 shadow-md w-full min-w-0">
                <input
                  type="text"
                  placeholder="Search 2,000+ courses, skills, or instructors..."
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 outline-none text-gray-800 bg-transparent placeholder-gray-400 text-sm sm:text-base min-w-0"
                />
                <Button 
                  className="rounded-r-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base flex-shrink-0"
                  size="sm"
                >
                  <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Explore Courses</span>
                  <span className="sm:hidden">Search</span>
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl w-full sm:w-auto"
              onClick={() => navigate("/catalog")}
            >
              Browse Courses
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              onClick={() => navigate("/register")}
            >
              Start Learning Free
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Floating Elements - Hidden on mobile to prevent overflow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl hidden sm:block">
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, -15, 0] }} 
            transition={{ 
              duration: prefersReducedMotion ? 0 : 6, 
              repeat: prefersReducedMotion ? 0 : Infinity, 
              ease: "easeInOut" 
            }}
            className="relative"
          >
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-gradient-to-br from-amber-300 to-orange-400 rounded-2xl opacity-20 blur-3xl" />
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-2xl opacity-20 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-white rounded-[3rem] shadow-2xl border-2 border-white/30 overflow-hidden transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50" />
              <div className="relative p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-xs font-medium text-gray-500 truncate">Featured Course</p>
                    <p className="text-sm font-bold text-gray-800 truncate">AI Fundamentals</p>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 w-3/4" />
                </div>
                <p className="text-xs text-gray-500 mt-1">75% completed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some", margin: "-100px" }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="text-center mb-12 sm:mb-16 px-2"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 leading-tight">
              Why Educators & Learners Love Shikshana
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of education with our intelligent, intuitive, and impactful learning platform.
            </p>
          </motion.div>
          
          <FeatureShowcase />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-indigo-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="text-center mb-12 sm:mb-16 px-2"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 leading-tight">
              Trusted by the Education Community
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ 
                  delay: prefersReducedMotion ? 0 : index * 0.1, 
                  duration: prefersReducedMotion ? 0.3 : 0.5,
                  ease: "easeOut"
                }}
                className="text-center p-4 sm:p-6"
              >
                <div className="inline-block mb-3 sm:mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{stat.label}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Company Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-indigo-50/50 to-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl transform rotate-3 opacity-20" />
              <div className="relative bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-100">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-3 bg-indigo-100 rounded-xl flex-shrink-0">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 ml-3 sm:ml-4">RSC Systems</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-base sm:text-lg">
                  <span className="font-semibold text-indigo-700">RSC Systems</span> is a premier software development company dedicated to engineering robust, innovative, and scalable digital solutions. With a focus on transforming business operations through technology, we specialize in creating platforms that drive efficiency and growth.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                  From enterprise resource planning to specialized educational platforms like Shikshana, our mission is to deliver excellence in code and user experience. We believe in technology that empowers people.
                </p>
                <a 
                  href="https://rscsys.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors group text-sm sm:text-base"
                >
                  Visit our official website
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 group-hover:animate-pulse" />
                </a>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 leading-tight">
                  Built by Experts, Designed for You
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Shikshana is proudly powered by RSC Systems, leveraging our deep expertise in cloud architecture and user-centric design to bring you a world-class learning management system.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1 sm:mb-2">25+ Years</div>
                  <div className="text-gray-600 text-sm sm:text-base">Industry Experience</div>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1 sm:mb-2">50+</div>
                  <div className="text-gray-600 text-sm sm:text-base">Successful Projects</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-indigo-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="text-center mb-12 sm:mb-16 px-2"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 font-medium mb-4 text-sm sm:text-base">
              <Quote className="w-4 h-4 inline mr-1" />
              Student & Educator Stories
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 leading-tight">
              Transforming Learning Experiences
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some", margin: "-50px" }}
                transition={{ 
                  delay: prefersReducedMotion ? 0 : index * 0.15, 
                  duration: prefersReducedMotion ? 0.3 : 0.5,
                  ease: "easeOut"
                }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-shadow transform-gpu"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-indigo-100">
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 italic mb-3 sm:mb-4 text-sm sm:text-base">"{testimonial.content}"</p>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-indigo-600">{testimonial.role}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{testimonial.institution}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-indigo-700 to-purple-800 text-white relative z-10">
        <div className="max-w-4xl mx-auto text-center relative z-10 px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-4 sm:mb-6 text-sm">
              <Star className="w-4 h-5 text-amber-300 mr-2" />
              <span>Join 50,000+ learners today</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Begin Your Journey with Shikshana
            </h2>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto mb-6 sm:mb-10">
              Experience the future of education with our intelligent, intuitive, and impactful learning platform.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0.3 : 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
          >
            <Button 
              size="lg" 
              className="bg-white text-indigo-700 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg w-full sm:w-auto"
              onClick={() => navigate("/register")}
            >
              Create Free Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer - Updated with RSC Systems Info */}
      <footer className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-gray-200 pt-16 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <img
                  src={saiLogo}
                  alt="Shikshana AI"
                  className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] object-contain drop-shadow-sm"
                />
              </div>
              <span className="ml-3 text-xl sm:text-2xl font-bold text-white">Shikshana AI</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              A product by RSC Systems. Empowering educators and learners to connect, create, and succeed together.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all transform-gpu"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-white mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {["About Us", "Courses", "Pricing", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm">
                    <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-white mb-4 sm:mb-6">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="https://rscsys.in" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  RSC Systems Website
                </a>
              </li>
              {["Our Team", "Technologies", "Case Studies", "Support"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm">
                    <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-white mb-4 sm:mb-6">Contact Us</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 mt-0.5 flex-shrink-0" />
                <span className="ml-2 sm:ml-3 text-gray-300 leading-relaxed">
                  RSC Systems,<br/>
                  #16/A, Near Prasanna Jyothi Ashram,<br/>
                  Ashwathanarayana Layout, JP Nagar 7th Phase,<br/>
                  Bangalore 560078
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 flex-shrink-0" />
                <a href="mailto:info@rscsys.in" className="ml-2 sm:ml-3 text-gray-300 hover:text-white transition-colors">
                  info@rscsys.in
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 flex-shrink-0" />
                <a href="tel:+919876543210" className="ml-2 sm:ml-3 text-gray-300 hover:text-white transition-colors">
                  +91 9900504406
                </a>
              </li>
              <li className="flex items-center">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 flex-shrink-0" />
                <a href="https://rscsys.in" target="_blank" rel="noreferrer" className="ml-2 sm:ml-3 text-gray-300 hover:text-white transition-colors">
                  www.rscsys.in
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 sm:mt-16 pt-6 sm:pt-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs sm:text-sm px-2">
          <p>© {new Date().getFullYear()} RSC Systems. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4 sm:space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}