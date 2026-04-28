import React from "react";
import { BookOpen, Users, Award, BarChart2 } from "lucide-react";

export default function DashboardStats({ stats = {}, isMobile = false }) {
  const cards = [
    {
      label: "Courses",
      value: stats.courses ?? 0,
      icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Students",
      value: stats.students ?? 0,
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Completions",
      value: stats.completions ?? 0,
      icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Rating",
      value: `${stats.rating ?? 0}`,
      icon: <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section 
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      role="region"
      aria-label="Dashboard statistics"
    >
      {cards.map((c, idx) => (
        <div
          key={idx}
          className="
            bg-white 
            p-3 sm:p-4 
            rounded-xl 
            border border-slate-100 
            shadow-sm 
            flex 
            items-center 
            gap-3 sm:gap-4 
            hover:shadow-md 
            transition-shadow
            min-w-0
            touch-manipulation
          "
        >
          {/* Icon Container - Compact on mobile */}
          <div className={`p-2.5 sm:p-3 rounded-xl ${c.bg} ${c.color} shrink-0 flex items-center justify-center`}>
            {c.icon}
          </div>
          
          {/* Text Content */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
              {c.label}
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
              {c.value}
            </h3>
          </div>
        </div>
      ))}
    </section>
  );
}