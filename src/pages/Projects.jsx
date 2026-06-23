import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/dashboard/ProgressBar";
import ProjectForm from "@/components/projects/ProjectForm";
import moment from "moment";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [p, t] = await Promise.all([
      base44.entities.Project.list("-created_date"),
      base44.entities.Task.list(),
    ]);
    setProjects(p);
    setTasks(t);
    setLoading(false);
  };

  const handleCreate = async (data) => {
    await base44.entities.Project.create(data);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (data) => {
    await base44.entities.Project.update(editProject.id, data);
    setEditProject(null);
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Project.delete(id);
    load();
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F0F0F2] border-t-[#2DDDA8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#0A0A0A]">Projects</h1>
          <p className="text-sm text-[#6B6B72]">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white gap-2">
            <Plus size={16} /> New Project
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
          <FolderKanban size={48} className="mx-auto text-[#DADADD] mb-4" />
          <h3 className="font-heading font-semibold text-lg text-[#0A0A0A] mb-1">No projects yet</h3>
          <p className="text-sm text-[#6B6B72] mb-4">Create your first project to get started</p>
          <Button onClick={() => setShowForm(true)} className="bg-[#2DDDA8] hover:bg-[#25C898] text-white gap-2">
            <Plus size={16} /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const pTasks = tasks.filter((t) => t.project_id === project.id);
            const done = pTasks.filter((t) => t.status === "done").length;
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color || "#2DDDA8" }} />
                    <h3 className="font-heading font-semibold text-[#0A0A0A] group-hover:text-[#2DDDA8] transition-colors truncate">
                      {project.title}
                    </h3>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                {project.description && (
                  <p className="text-xs text-[#6B6B72] mb-3 line-clamp-2">{project.description}</p>
                )}
                <ProgressBar
                  label={`${done}/${pTasks.length} tasks`}
                  value={done}
                  max={pTasks.length || 1}
                  color={project.color || "#2DDDA8"}
                />
                <div className="flex items-center gap-3 mt-3 text-[10px] text-[#6B6B72]">
                  {project.start_date && <span>Start: {moment(project.start_date).format("MMM D")}</span>}
                  {project.end_date && <span>Due: {moment(project.end_date).format("MMM D")}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={showForm || !!editProject} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditProject(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editProject ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={editProject}
            onSubmit={editProject ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditProject(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}