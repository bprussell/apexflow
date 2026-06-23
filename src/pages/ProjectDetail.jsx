import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/dashboard/ProgressBar";
import ProjectForm from "@/components/projects/ProjectForm";
import TaskForm from "@/components/tasks/TaskForm";
import CommentSection from "@/components/comments/CommentSection";
import moment from "moment";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    const [p, allTasks, allProjects] = await Promise.all([
      base44.entities.Project.get(id),
      base44.entities.Task.filter({ project_id: id }, "-created_date"),
      base44.entities.Project.list(),
    ]);
    setProject(p);
    setTasks(allTasks);
    setProjects(allProjects);
    setLoading(false);
  };

  const handleUpdateProject = async (data) => {
    await base44.entities.Project.update(id, data);
    setShowEditProject(false);
    load();
  };

  const handleDeleteProject = async () => {
    await base44.entities.Project.delete(id);
    navigate("/projects");
  };

  const handleAddTask = async (data) => {
    await base44.entities.Task.create({ ...data, project_id: id });
    setShowAddTask(false);
    load();
  };

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    await base44.entities.Task.update(task.id, { status: nextStatus });
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F0F0F2] border-t-[#2DDDA8] rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B6B72]">Project not found</p>
        <Link to="/projects" className="text-[#2DDDA8] text-sm mt-2 inline-block">Back to projects</Link>
      </div>
    );
  }

  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/projects" className="p-2 rounded-xl hover:bg-white transition-colors">
          <ArrowLeft size={18} className="text-[#6B6B72]" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || "#2DDDA8" }} />
            <h1 className="font-heading text-2xl font-bold text-[#0A0A0A] truncate">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && <p className="text-sm text-[#6B6B72] mt-1 ml-7">{project.description}</p>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="icon" onClick={() => setShowEditProject(true)}>
            <Pencil size={14} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDeleteProject} className="text-red-500 hover:bg-red-50">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Progress & Meta */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <MetaItem label="Status" value={<StatusBadge status={project.status} />} />
          <MetaItem label="Priority" value={<StatusBadge status={project.priority} />} />
          <MetaItem label="Start" value={project.start_date ? moment(project.start_date).format("MMM D, YYYY") : "—"} />
          <MetaItem label="Due" value={project.end_date ? moment(project.end_date).format("MMM D, YYYY") : "—"} />
        </div>
        <ProgressBar label={`${done} of ${tasks.length} tasks completed`} value={done} max={tasks.length || 1} color={project.color || "#2DDDA8"} />
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading font-semibold text-lg text-[#0A0A0A]">Tasks</h2>
          <Button onClick={() => setShowAddTask(true)} size="sm" className="bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white gap-1.5">
            <Plus size={14} /> Add Task
          </Button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-[#6B6B72] text-center py-8">No tasks yet — add one to get started</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F5F7] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleTask(t)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      t.status === "done"
                        ? "bg-[#2DDDA8] border-[#2DDDA8] text-white"
                        : "border-[#DADADD] hover:border-[#2DDDA8]"
                    }`}
                  >
                    {t.status === "done" && <span className="text-xs">✓</span>}
                  </button>
                  <Link to={`/tasks/${t.id}`} className="min-w-0">
                    <span className={`text-sm font-medium truncate ${t.status === "done" ? "line-through text-[#6B6B72]" : "text-[#0A0A0A]"}`}>
                      {t.title}
                    </span>
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={t.priority} />
                  {t.due_date && (
                    <span className="text-[10px] text-[#6B6B72]">{moment(t.due_date).format("MMM D")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
        <CommentSection projectId={id} />
      </div>

      <Dialog open={showEditProject} onOpenChange={setShowEditProject}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          <ProjectForm project={project} onSubmit={handleUpdateProject} onCancel={() => setShowEditProject(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <TaskForm projects={projects} onSubmit={handleAddTask} onCancel={() => setShowAddTask(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-[#6B6B72] font-medium">{label}</span>
      <div className="mt-0.5">{typeof value === "string" ? <span className="text-sm font-medium text-[#0A0A0A]">{value}</span> : value}</div>
    </div>
  );
}