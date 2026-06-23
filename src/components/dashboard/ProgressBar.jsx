import React, { useEffect, useState } from "react";

export default function ProgressBar({ label, value, max = 100, color = "#2DDDA8" }) {
  const [width, setWidth] = useState(0);
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[#0A0A0A]">{label}</span>
        <span className="text-xs font-semibold text-[#6B6B72]">{Math.round(pct)}%</span>
      </div>
      <div className="h-3 bg-[#F0F0F2] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-[600ms] ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 3px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}