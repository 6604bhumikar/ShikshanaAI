import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardChart({ chartData = [], isMobile = false }) {
  // Auto-detect mobile if not passed
  const isMobileView = isMobile || (typeof window !== 'undefined' && window.innerWidth < 768);

  // Chart configuration - scaled for mobile
  const chartConfig = {
    margin: isMobileView 
      ? { top: 10, right: 0, left: -20, bottom: 0 } 
      : { top: 10, right: 0, left: -10, bottom: 0 },
    barSize: isMobileView ? 16 : 24,
    fontSize: isMobileView ? 10 : 12,
    tickDy: isMobileView ? 6 : 10,
    minHeight: isMobileView ? 200 : 250,
    padding: isMobileView ? "p-4" : "p-6",
  };

  // Custom tooltip for mobile - compact
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.[0]) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-2.5 sm:p-3 min-w-[120px]">
          <p className="text-xs sm:text-sm font-medium text-slate-800 mb-1">{label}</p>
          <p className="text-sm sm:text-base font-bold text-indigo-600">
            {payload[0].value} enrollments
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm text-slate-400 ${chartConfig.padding}`}>
        <svg className={`w-10 h-10 sm:w-12 sm:h-12 mb-2 opacity-20`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-xs sm:text-sm font-medium text-center">No enrollment data yet</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 ${chartConfig.padding} flex flex-col`}>
      {/* Header - Compact on mobile */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">Enrollment Trends</h3>
        <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full whitespace-nowrap">
          Year to Date
        </span>
      </div>
      
      {/* Chart Container - Responsive height */}
      <div className={`flex-1 w-full min-h-[${chartConfig.minHeight}px]`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={chartConfig.margin}>
            <CartesianGrid 
              strokeDasharray="4 4" 
              vertical={false} 
              stroke="#f1f5f9" 
              strokeOpacity={isMobileView ? 0.5 : 1}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: chartConfig.fontSize }}
              dy={chartConfig.tickDy}
              interval={isMobileView ? "preserveStartEnd" : 0}
            />
            <YAxis 
              allowDecimals={false} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: chartConfig.fontSize }}
              width={isMobileView ? 20 : 30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]}
              barSize={chartConfig.barSize}
              animationDuration={isMobileView ? 300 : 500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}