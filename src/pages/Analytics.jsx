import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import moment from "moment";

const COLORS = ["#2DDDA8", "#A78BFA", "#F5B080", "#FF6B6B", "#60A5FA"];

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, t] = await Promise.all([
        base44.entities.Project.list(),
        base44.entities.Task.list(),
      ]);
      setProjects(p);
      setTasks(t);
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

  // Task status distribution
  const statusCounts = {};
  tasks.forEach((t) => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }));

  // Priority distribution
  const priorityCounts = {};
  tasks.forEach((t) => { priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1; });
  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Weekly velocity
  const velocityData = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = moment().subtract(i, "weeks").startOf("week");
    const weekEnd = moment().subtract(i, "weeks").endOf("week");
    const created = tasks.filter((t) => moment(t.created_date).isBetween(weekStart, weekEnd)).length;
    const completed = tasks.filter((t) => t.status === "done" && moment(t.updated_date).isBetween(weekStart, weekEnd)).length;
    velocityData.push({ week: weekStart.format("MMM D"), created, completed });
  }

  // Project task counts
  const projectTaskData = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.project_id === p.id);
    return {
      name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
      total: pTasks.length,
      done: pTasks.filter((t) => t.status === "done").length,
    };
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;
  const avgCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#0A0A0A]">Analytics</h1>
        <p className="text-sm text-[#6B6B72]">Performance insights across all projects</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Tasks" value={totalTasks} color="#A78BFA" />
        <SummaryCard label="Completed" value={completedTasks} color="#2DDDA8" />
        <SummaryCard label="Overdue" value={overdueTasks} color="#FF6B6B" />
        <SummaryCard label="Completion Rate" value={`${avgCompletion}%`} color="#F5B080" />
      </div>

      {/* Velocity Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
        <h2 className="font-heading font-semibold text-lg text-[#0A0A0A] mb-4">Task Velocity (12 Weeks)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={velocityData}>
            <defs>
              <linearGradient id="aGradMint" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DDDA8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2DDDA8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aGradPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#6B6B72", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B6B72", fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8E8EA" }} />
            <Legend />
            <Area type="monotone" dataKey="created" stroke="#A78BFA" strokeWidth={3} fill="url(#aGradPurple)" name="Created" />
            <Area type="monotone" dataKey="completed" stroke="#2DDDA8" strokeWidth={3} fill="url(#aGradMint)" name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
          <h2 className="font-heading font-semibold text-lg text-[#0A0A0A] mb-4">Task Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8E8EA" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#6B6B72] text-center py-12">No data yet</p>
          )}
        </div>

        {/* Project Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
          <h2 className="font-heading font-semibold text-lg text-[#0A0A0A] mb-4">Project Breakdown</h2>
          {projectTaskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectTaskData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B6B72", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B6B72", fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E8E8EA" }} />
                <Legend />
                <Bar dataKey="total" fill="#A78BFA" radius={[6, 6, 0, 0]} name="Total" />
                <Bar dataKey="done" fill="#2DDDA8" radius={[6, 6, 0, 0]} name="Done" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#6B6B72] text-center py-12">No projects yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
      <span className="text-xs font-medium text-[#6B6B72] uppercase tracking-wider">{label}</span>
      <p className="font-heading text-3xl font-bold mt-1" style={{ color }}>{value}</p>
    </div>
  );
}