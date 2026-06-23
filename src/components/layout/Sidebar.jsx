import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  return (
    <div
      className={`fixed left-3 top-3 bottom-3 z-40 flex flex-col transition-all duration-300 ease-in-out ${
        expanded ? "w-56" : "w-16"
      } bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E8E8EA]`}
    >
      <div className="flex items-center gap-2 px-4 pt-5 pb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2DDDA8] to-[#A78BFA] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {expanded && (
          <span className="font-heading font-semibold text-[15px] text-[#0A0A0A] truncate">
            ProjectHub
          </span>
        )}
      </div>

      <div className="h-px bg-[#EDEDEF] mx-3" />

      <nav className="flex-1 flex flex-col gap-1 px-2 pt-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#0A0A0A] text-white shadow-md"
                  : "text-[#6B6B72] hover:bg-[#F5F5F7] hover:text-[#0A0A0A]"
              }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {expanded && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-3 flex flex-col gap-1">
        <button
          onClick={() => base44.auth.logout("/")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B6B72] hover:bg-red-50 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {expanded && <span>Log out</span>}
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-[#6B6B72] hover:bg-[#F5F5F7] transition-all"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}