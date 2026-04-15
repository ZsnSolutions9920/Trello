"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ContactMessageWithReplies } from "@/types";

interface Props {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function MessagesSidebar({ boardId, isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<ContactMessageWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.inbox.boardMessages(boardId).then(setMessages).catch(() => {}).finally(() => setLoading(false));
    }
  }, [isOpen, boardId]);

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      const reply = await api.inbox.reply(boardId, messageId, replyContent.trim());
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, replies: [...m.replies, reply] } : m),
      );
      setReplyContent("");
      setReplyingTo(null);
    } catch {}
    setSending(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 animate-fade-in" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white border-l border-border z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-ink">Messages</h2>
            <p className="text-xs text-ink-tertiary">{messages.length} messages</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-tertiary hover:text-ink hover:bg-surface transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 py-12 justify-center">
              <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />
              <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }} />
              <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }} />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-ink-tertiary text-sm text-center py-12">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="bg-surface border border-border rounded-2xl p-4">
                {/* Sender */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{msg.senderName}</p>
                    <p className="text-[10px] text-ink-tertiary">{formatTime(msg.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm text-ink leading-relaxed mb-3">{msg.content}</p>

                {/* Replies */}
                {msg.replies.length > 0 && (
                  <div className="border-t border-border pt-2 mb-2 space-y-2">
                    {msg.replies.map((r) => (
                      <div key={r.id} className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-ink flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5">
                          Y
                        </div>
                        <div>
                          <p className="text-xs text-ink">{r.content}</p>
                          <p className="text-[10px] text-ink-tertiary">{formatTime(r.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === msg.id ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Reply..."
                      className="flex-1 border border-border rounded-lg px-3 py-1.5 text-xs text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-ink"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleReply(msg.id);
                        if (e.key === "Escape") { setReplyingTo(null); setReplyContent(""); }
                      }}
                    />
                    <button
                      onClick={() => handleReply(msg.id)}
                      disabled={!replyContent.trim() || sending}
                      className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40"
                    >
                      Send
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setReplyingTo(msg.id); setReplyContent(""); }}
                    className="text-xs text-ink-tertiary hover:text-ink transition-colors"
                  >
                    Reply
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
