import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiRing from "@/components/dashboard/KpiRing";
import ProgressBar from "@/components/dashboard/ProgressBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import moment from "moment";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, t, u] = await Promise.all([
        base44.entities.Project.list("-created_date"),
        base44.entities.Task.list("-created_date"),
        base44.auth.me(),
      ]);
      setProjects(p);
      setTasks(t);
      setUser(u);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F0F0F2] border-t-[#2DDDA8] rounded-full animate-spin" />
      </div>
    );
  }

  const totalProjects = projects.length;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Build trend data from tasks
  const trendData = buildTrendData(tasks);

  // Project progress
  const projectProgress = projects.slice(0, 5).map((p) => {
    const projectTasks = tasks.filter((t) => t.project_id === p.id);
    const done = projectTasks.filter((t) => t.status === "done").length;
    return { label: p.title, value: done, max: projectTasks.length || 1, color: p.color || "#2DDDA8" };
  });

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-[#0A0A0A]">
            {greeting()}, {user?.full_name?.split(" ")[0] || "there"}.
          </h1>
          <p className="text-sm text-[#6B6B72] mt-1">
            {overdueTasks > 0
              ? `You have ${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""} and ${activeTasks} active tasks.`
              : `You have ${activeTasks} active tasks across ${totalProjects} projects.`}
          </p>
        </div>
        <Link to="/projects">
          <Button className="bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white gap-2">
            <Plus size={16} /> New Project
          </Button>
        </Link>
      </div>

      {/* KPI Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiRing value={totalProjects} total={Math.max(totalProjects, 1)} label="Projects" color="#2DDDA8" />
        <KpiRing value={activeTasks} total={Math.max(tasks.length, 1)} label="Active Tasks" color="#A78BFA" />
        <KpiRing value={completionRate} total={100} label="Completion" color="#2DDDA8" suffix="%" />
        <KpiRing value={overdueTasks} total={Math.max(tasks.length, 1)} label="Overdue" color="#FF6B6B" />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading font-semibold text-lg text-[#0A0A0A]">Task Velocity</h2>
          <span className="text-xs text-[#6B6B72]">Last 7 days</span>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DDDA8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2DDDA8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6B6B72", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B6B72", fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8E8EA", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="created" stroke="#A78BFA" strokeWidth={3} fill="url(#purpleGrad)" name="Created" />
              <Area type="monotone" dataKey="completed" stroke="#2DDDA8" strokeWidth={3} fill="url(#mintGrad)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-[#6B6B72]">
            Add tasks to see velocity trends
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-semibold text-lg text-[#0A0A0A]">Project Progress</h2>
            <Link to="/projects" className="text-xs text-[#2DDDA8] font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {projectProgress.length > 0 ? (
            <div className="space-y-4">
              {projectProgress.map((p, i) => (
                <ProgressBar key={i} {...p} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B6B72] text-center py-8">No projects yet</p>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-semibold text-lg text-[#0A0A0A]">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-[#2DDDA8] font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentTasks.length > 0 ? (
            <div className="space-y-2">
              {recentTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F5F7] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === "done" ? "bg-[#2DDDA8]" : t.due_date && new Date(t.due_date) < new Date() ? "bg-[#FF6B6B]" : "bg-[#A78BFA]"}`} />
                    <span className="text-sm font-medium text-[#0A0A0A] truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.due_date && (
                      <span className="text-[10px] text-[#6B6B72] flex items-center gap-1">
                        <Clock size={10} />
                        {moment(t.due_date).format("MMM D")}
                      </span>
                    )}
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B6B72] text-center py-8">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function buildTrendData(tasks) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = moment().subtract(i, "days");
    const dayStr = date.format("YYYY-MM-DD");
    const label = date.format("ddd");
    const created = tasks.filter((t) => moment(t.created_date).format("YYYY-MM-DD") === dayStr).length;
    const completed = tasks.filter((t) => t.status === "done" && moment(t.updated_date).format("YYYY-MM-DD") === dayStr).length;
    days.push({ day: label, created, completed });
  }
  return days;
}