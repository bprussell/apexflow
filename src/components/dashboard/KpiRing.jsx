import React, { useEffect, useState } from "react";

export default function KpiRing({ value, total, label, color = "#2DDDA8", suffix = "" }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={radius}
            fill="none" stroke="#F0F0F2" strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-[800ms] ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-bold text-2xl text-[#0A0A0A]">
            {value}{suffix}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-[#6B6B72] uppercase tracking-wider">{label}</span>
    </div>
  );
}