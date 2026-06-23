import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import moment from "moment";

export default function CommentSection({ projectId, taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadComments();
    base44.auth.me().then(setUser).catch(() => {});
  }, [projectId, taskId]);

  const loadComments = async () => {
    const filter = {};
    if (projectId) filter.project_id = projectId;
    if (taskId) filter.task_id = taskId;
    const data = await base44.entities.Comment.filter(filter, "-created_date");
    setComments(data);
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    await base44.entities.Comment.create({
      content: content.trim(),
      project_id: projectId || undefined,
      task_id: taskId || undefined,
      author_name: user?.full_name || "Anonymous",
    });
    setContent("");
    setSending(false);
    loadComments();
  };

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-[#0A0A0A]">Comments</h4>
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <Button
          onClick={handleSend}
          disabled={sending || !content.trim()}
          size="icon"
          className="bg-[#2DDDA8] hover:bg-[#25C898] text-white self-end"
        >
          <Send size={16} />
        </Button>
      </div>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-xs text-[#6B6B72] text-center py-4">No comments yet</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-[#F5F5F7] rounded-xl p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#0A0A0A]">{c.author_name || "Anonymous"}</span>
              <span className="text-[10px] text-[#6B6B72]">{moment(c.created_date).fromNow()}</span>
            </div>
            <p className="text-sm text-[#3A3A40]">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}