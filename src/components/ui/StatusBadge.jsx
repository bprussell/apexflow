import React from "react";

const statusStyles = {
  planning: { bg: "bg-[#ECE7FF]", text: "text-[#7C3AED]" },
  active: { bg: "bg-[#C2F4DF]", text: "text-[#059669]" },
  on_hold: { bg: "bg-[#FADCC7]", text: "text-[#D97706]" },
  completed: { bg: "bg-[#C2F4DF]", text: "text-[#047857]" },
  cancelled: { bg: "bg-[#FFD1D1]", text: "text-[#DC2626]" },
  todo: { bg: "bg-[#F0F0F2]", text: "text-[#6B6B72]" },
  in_progress: { bg: "bg-[#C2F4DF]", text: "text-[#059669]" },
  in_review: { bg: "bg-[#ECE7FF]", text: "text-[#7C3AED]" },
  done: { bg: "bg-[#2DDDA8]/15", text: "text-[#047857]" },
  low: { bg: "bg-[#F0F0F2]", text: "text-[#6B6B72]" },
  medium: { bg: "bg-[#FADCC7]", text: "text-[#D97706]" },
  high: { bg: "bg-[#FFD1D1]", text: "text-[#DC2626]" },
  critical: { bg: "bg-[#FF6B6B]/15", text: "text-[#DC2626]" },
};

const labels = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.todo;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {labels[status] || status}
    </span>
  );
}