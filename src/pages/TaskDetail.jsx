import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Flag } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import CommentSection from "@/components/comments/CommentSection";
import moment from "moment";

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const t = await base44.entities.Task.get(id);
      setTask(t);
      if (t.project_id) {
        const p = await base44.entities.Project.get(t.project_id);
        setProject(p);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F0F0F2] border-t-[#2DDDA8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B6B72]">Task not found</p>
        <Link to="/tasks" className="text-[#2DDDA8] text-sm mt-2 inline-block">Back to tasks</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/tasks" className="p-2 rounded-xl hover:bg-white transition-colors">
          <ArrowLeft size={18} className="text-[#6B6B72]" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-xl font-bold text-[#0A0A0A]">{task.title}</h1>
          {project && (
            <Link to={`/projects/${project.id}`} className="text-xs text-[#2DDDA8] hover:underline flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color || "#2DDDA8" }} />
              {project.title}
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA] space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B6B72]">Status</span>
            <div className="mt-1"><StatusBadge status={task.status} /></div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B6B72]">Priority</span>
            <div className="mt-1"><StatusBadge status={task.priority} /></div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B6B72]">Due Date</span>
            <p className="text-sm font-medium text-[#0A0A0A] mt-1 flex items-center gap-1">
              <Clock size={12} className="text-[#6B6B72]" />
              {task.due_date ? moment(task.due_date).format("MMM D, YYYY") : "—"}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B6B72]">Est. Hours</span>
            <p className="text-sm font-medium text-[#0A0A0A] mt-1">{task.estimated_hours || "—"}</p>
          </div>
        </div>
        {task.description && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B6B72]">Description</span>
            <p className="text-sm text-[#3A3A40] mt-1 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
        <CommentSection taskId={id} />
      </div>
    </div>
  );
}