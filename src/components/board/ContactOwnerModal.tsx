"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { getBoardColorById } from "@/lib/board-colors";
import type { ContactMessageWithReplies } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short", day: "numeric",
  });
}

export function ContactOwnerModal({ isOpen, onClose, boardId }: Props) {
  const [messages, setMessages] = useState<ContactMessageWithReplies[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const color = getBoardColorById(boardId);

  useEffect(() => {
    if (isOpen) {
      setLoadingMsgs(true);
      api.inbox.boardMessages(boardId).then((data) => {
        setMessages(data);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 100);
      }).catch(() => {}).finally(() => setLoadingMsgs(false));
    }
  }, [isOpen, boardId]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.messages.send(boardId, { senderName: "Board Visitor", content: content.trim() });
      setContent("");
      const data = await api.inbox.boardMessages(boardId);
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) return;
    setReplying(true);
    try {
      const reply = await api.inbox.reply(boardId, messageId, replyContent.trim());
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, replies: [...m.replies, reply] } : m),
      );
      setReplyContent("");
      setReplyingTo(null);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
    } catch {}
    setReplying(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 animate-fade-in" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[420px] max-w-[92vw] bg-white z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header — board accent colored strip + clean title */}
        <div style={{ backgroundColor: color.hex }} className="h-1.5 shrink-0" />
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color.hexLight }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink">Messages</h2>
              <p className="text-[11px] text-ink-tertiary">
                {messages.length === 0 ? "Start a conversation" : `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
              </p>
            </div>
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

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-surface/30">
          {loadingMsgs ? (
            <div className="flex items-center gap-2 py-16 justify-center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex, animation: "pulse-dot 1.4s ease-in-out infinite" }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex, animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex, animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: color.hexLight }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color.hex} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-ink-secondary">No messages yet</p>
              <p className="text-xs text-ink-tertiary mt-1">Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              // Show date separator
              const prevDate = i > 0 ? formatDate(messages[i - 1].createdAt) : null;
              const thisDate = formatDate(msg.createdAt);
              const showDate = thisDate !== prevDate;

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] font-medium text-ink-tertiary uppercase tracking-wider">{thisDate}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  {/* Incoming message bubble */}
                  <div className="flex gap-2.5 items-start">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: color.hex }}
                    >
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-ink">{msg.senderName}</span>
                        <span className="text-[10px] text-ink-tertiary">{formatTime(msg.createdAt)}</span>
                      </div>
                      <div className="bg-white border border-border rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm">
                        <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Replies — right-aligned as "your" messages */}
                      {msg.replies.map((r) => (
                        <div key={r.id} className="flex justify-end mt-2">
                          <div className="max-w-[85%]">
                            <div
                              className="rounded-2xl rounded-tr-md px-3.5 py-2.5 shadow-sm"
                              style={{ backgroundColor: color.hexLight }}
                            >
                              <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{r.content}</p>
                            </div>
                            <p className="text-[10px] text-ink-tertiary mt-0.5 text-right pr-1">{formatTime(r.createdAt)}</p>
                          </div>
                        </div>
                      ))}

                      {/* Reply action */}
                      {replyingTo === msg.id ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 border border-border rounded-xl px-3 py-2 text-[13px] text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-ink bg-white"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(msg.id); }
                              if (e.key === "Escape") { setReplyingTo(null); setReplyContent(""); }
                            }}
                          />
                          <button
                            onClick={() => handleReply(msg.id)}
                            disabled={!replyContent.trim() || replying}
                            className="text-white text-xs px-3 py-2 rounded-xl font-semibold disabled:opacity-40 transition-all"
                            style={{ backgroundColor: color.hex }}
                          >
                            Reply
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReplyingTo(msg.id); setReplyContent(""); }}
                          className="text-[11px] text-ink-tertiary hover:text-ink transition-colors mt-1.5 ml-1"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compose bar — fixed at bottom */}
        <div className="px-4 py-3 border-t border-border bg-white shrink-0">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2 mb-2 border border-red-100">
              {error}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink focus:outline-none resize-none leading-snug"
              rows={1}
              maxLength={2000}
              style={{ minHeight: 42, maxHeight: 100 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !content.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all duration-150 active:scale-[0.95] shrink-0"
              style={{ backgroundColor: color.hex }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
