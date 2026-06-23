import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, CheckSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/ui/StatusBadge";
import TaskForm from "@/components/tasks/TaskForm";
import moment from "moment";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [t, p] = await Promise.all([
      base44.entities.Task.list("-created_date"),
      base44.entities.Project.list(),
    ]);
    setTasks(t);
    setProjects(p);
    setLoading(false);
  };

  const projectMap = {};
  projects.forEach((p) => { projectMap[p.id] = p; });

  const handleCreate = async (data) => {
    await base44.entities.Task.create(data);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (data) => {
    await base44.entities.Task.update(selectedTask.id, data);
    setSelectedTask(null);
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Task.delete(id);
    setSelectedTask(null);
    load();
  };

  const handleToggle = async (task) => {
    const next = task.status === "done" ? "todo" : "done";
    await base44.entities.Task.update(task.id, { status: next });
    load();
  };

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

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
          <h1 className="font-heading text-2xl font-bold text-[#0A0A0A]">Tasks</h1>
          <p className="text-sm text-[#6B6B72]">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white gap-2">
          <Plus size={16} /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B72]" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA]">
          <CheckSquare size={48} className="mx-auto text-[#DADADD] mb-4" />
          <h3 className="font-heading font-semibold text-lg text-[#0A0A0A] mb-1">No tasks found</h3>
          <p className="text-sm text-[#6B6B72] mb-4">Create a task to start tracking your work</p>
          <Button onClick={() => setShowForm(true)} className="bg-[#2DDDA8] hover:bg-[#25C898] text-white gap-2">
            <Plus size={16} /> Add Task
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E8EA] divide-y divide-[#F0F0F2]">
          {filtered.map((task) => {
            const proj = projectMap[task.project_id];
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.status === "done" ? "bg-[#2DDDA8] border-[#2DDDA8] text-white" : "border-[#DADADD] hover:border-[#2DDDA8]"
                  }`}
                >
                  {task.status === "done" && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium block truncate ${task.status === "done" ? "line-through text-[#6B6B72]" : "text-[#0A0A0A]"}`}>
                    {task.title}
                  </span>
                  {proj && (
                    <span className="text-[10px] text-[#6B6B72] flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.color || "#2DDDA8" }} />
                      {proj.title}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={task.priority} />
                  <StatusBadge status={task.status} />
                  {task.due_date && (
                    <span className={`text-[10px] font-medium ${new Date(task.due_date) < new Date() && task.status !== "done" ? "text-[#FF6B6B]" : "text-[#6B6B72]"}`}>
                      {moment(task.due_date).format("MMM D")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <TaskForm projects={projects} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit/Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => { if (!open) setSelectedTask(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <>
              <TaskForm
                task={selectedTask}
                projects={projects}
                onSubmit={handleUpdate}
                onCancel={() => setSelectedTask(null)}
              />
              <Button
                variant="outline"
                onClick={() => handleDelete(selectedTask.id)}
                className="text-red-500 hover:bg-red-50 mt-2"
              >
                <span className="flex items-center gap-1.5">Delete Task</span>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}