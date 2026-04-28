import React from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export default function AnimatedBackground({ children, className = "" }) {
  const containerRef = useRef(null);
  const blob1Controls = useAnimation();
  const blob2Controls = useAnimation();
  const blob3Controls = useAnimation();
  const blob4Controls = useAnimation();
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });

  // Start animations when component is in view
  useEffect(() => {
    if (isInView) {
      blob1Controls.start({
        y: ["0%", "100%", "0%"],
        x: ["0%", "-50%", "0%"],
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
        transition: {
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }
      });
      
      blob2Controls.start({
        y: ["0%", "-100%", "0%"],
        x: ["0%", "50%", "0%"],
        scale: [1, 1.2, 1],
        rotate: [0, -180, -360],
        transition: {
          duration: 30,
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }
      });
      
      blob3Controls.start({
        y: ["0%", "80%", "0%"],
        x: ["0%", "-30%", "0%"],
        scale: [1, 1.15, 1],
        opacity: [0.2, 0.3, 0.2],
        transition: {
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }
      });
      
      blob4Controls.start({
        y: ["0%", "-70%", "0%"],
        x: ["0%", "40%", "0%"],
        scale: [1, 1.25, 1],
        opacity: [0.15, 0.25, 0.15],
        transition: {
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6
        }
      });
    } else {
      blob1Controls.stop();
      blob2Controls.stop();
      blob3Controls.stop();
      blob4Controls.stop();
    }
  }, [isInView, blob1Controls, blob2Controls, blob3Controls, blob4Controls]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/30">
        {/* Subtle Noise Texture for Depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 
              `radial-gradient(circle at 10% 20%, rgba(0,0,0,0.03) 0%, transparent 20%),
               radial-gradient(circle at 90% 80%, rgba(0,0,0,0.05) 0%, transparent 25%),
               radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 30%)`,
            backgroundSize: "100% 100%",
            mixBlendMode: "overlay"
          }}
        />
      </div>

      {/* Floating Blobs with Framer Motion */}
      <motion.div
        animate={blob1Controls}
        className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-gradient-to-br from-purple-300/40 to-indigo-400/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      
      <motion.div
        animate={blob2Controls}
        className="absolute top-[50%] right-[-15%] w-[350px] h-[350px] bg-gradient-to-br from-amber-200/30 to-pink-300/40 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      
      <motion.div
        animate={blob3Controls}
        className="absolute bottom-[-20%] left-[20%] w-[250px] h-[250px] bg-gradient-to-br from-emerald-200/25 to-teal-300/35 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />
      
      <motion.div
        animate={blob4Controls}
        className="absolute top-[20%] right-[10%] w-[200px] h-[200px] bg-gradient-to-br from-blue-200/20 to-cyan-300/30 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}