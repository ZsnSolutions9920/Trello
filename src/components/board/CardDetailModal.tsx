"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useBoardStore } from "@/store/board.store";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import type { Card, Comment, TeamMember } from "@/types";

interface Props {
  card: Card | null;
  listTitle: string;
  onClose: () => void;
}

export function CardDetailModal({ card, listTitle, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const [description, setDescription] = useState(card?.description || "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newComment, setNewComment] = useState("");
  const updateCard = useBoardStore((s) => s.updateCard);

  useEffect(() => {
    if (card) {
      setDescription(card.description || "");
      api.comments.list(card.id).then(setComments).catch(() => {});
      api.team.get().then((team) => setTeamMembers(team?.members || [])).catch(() => {
        setTeamMembers([]);
      });
    }
  }, [card]);

  if (!card) return null;

  const handleSaveDescription = () => {
    updateCard(card.id, { description: description || null });
    setEditingDesc(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment = await api.comments.create(card.id, newComment.trim());
      setComments([comment, ...comments]);
      setNewComment("");
    } catch {
      // silent
    }
  };

  const taggableEmployees = teamMembers.filter(
    (member) => member.role === "employee" && member.id !== user?.id,
  );

  const insertMention = (email: string) => {
    setNewComment((prev) => {
      const separator = prev.length > 0 && !prev.endsWith(" ") ? " " : "";
      return `${prev}${separator}@${email} `;
    });
  };

  return (
    <Modal isOpen={!!card} onClose={onClose} title={card.title}>
      <div className="space-y-6">
        {/* List context */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-tertiary uppercase tracking-wider">
            List
          </span>
          <span className="text-xs font-semibold text-ink bg-surface rounded-md px-2 py-0.5">
            {listTitle}
          </span>
        </div>

        {/* Description section */}
        <div>
          <h3 className="text-sm font-bold text-ink mb-3">Description</h3>
          {editingDesc ? (
            <div className="space-y-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="focus-ring w-full border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-tertiary min-h-[100px] transition-colors hover:border-ink-tertiary focus:border-ink"
                placeholder="Add a description..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  className="bg-black text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.97]"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setDescription(card.description || "");
                    setEditingDesc(false);
                  }}
                  className="text-ink-secondary text-sm px-3 py-2 border border-border rounded-lg hover:text-ink hover:border-ink-tertiary transition-all duration-150"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingDesc(true)}
              className="bg-surface rounded-xl px-4 py-3 text-sm text-ink-secondary min-h-[60px] cursor-pointer hover:bg-border/50 transition-colors"
            >
              {card.description || "Click to add a description..."}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Comments section */}
        <div>
          <h3 className="text-sm font-bold text-ink mb-3">Activity</h3>
          <div className="space-y-3 mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment... Use @employee@email.com to tag teammates"
              className="focus-ring w-full border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            {taggableEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {taggableEmployees.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => insertMention(member.email)}
                    className="text-xs px-2.5 py-1 rounded-full border border-border text-ink-secondary hover:text-ink hover:border-ink-tertiary hover:bg-surface transition-colors"
                    title={`Tag ${member.name || member.email}`}
                  >
                    @{member.name || member.email}
                  </button>
                ))}
              </div>
            )}
            {newComment.trim() && (
              <button
                onClick={handleAddComment}
                className="bg-black text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.97]"
              >
                Comment
              </button>
            )}
          </div>

          {comments.length === 0 ? (
            <p className="text-sm text-ink-tertiary">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-ink-tertiary">U</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-surface rounded-xl px-3.5 py-2.5">
                      <p className="text-sm text-ink">{c.content}</p>
                    </div>
                    <p className="text-[11px] text-ink-tertiary mt-1 px-1">
                      {new Date(c.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
