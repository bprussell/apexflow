import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const checkWidth = () => setSidebarExpanded(window.innerWidth >= 1024);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F0F2]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="md:ml-[240px] p-4 md:p-6 min-h-screen transition-all duration-300">
        <Outlet />
      </main>
      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8EA] flex justify-around py-2 px-4 z-50">
      {[
        { icon: "📊", label: "Dashboard", path: "/" },
        { icon: "📁", label: "Projects", path: "/projects" },
        { icon: "✅", label: "Tasks", path: "/tasks" },
        { icon: "📈", label: "Analytics", path: "/analytics" },
      ].map((item) => (
        <a
          key={item.path}
          href={item.path}
          className="flex flex-col items-center gap-0.5 text-[10px] text-[#6B6B72] hover:text-[#0A0A0A]"
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  );
}