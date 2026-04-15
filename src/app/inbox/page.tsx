"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/board/Header";
import { api } from "@/lib/api";
import { getBoardColorById } from "@/lib/board-colors";
import type { InboxThread, ContactMessageWithReplies } from "@/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageWithReplies | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.inbox.list().then((data) => {
      setThreads(data);
      if (data.length > 0) {
        setSelectedThread(data[0]);
        if (data[0].messages.length > 0) setSelectedMessage(data[0].messages[0]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSelectThread = (thread: InboxThread) => {
    setSelectedThread(thread);
    setSelectedMessage(thread.messages[0] || null);
    setReplyContent("");
    setTimeout(() => chatRef.current?.scrollTo({ top: 0 }), 50);
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedMessage || !selectedThread) return;
    setReplying(true);
    try {
      const reply = await api.inbox.reply(selectedThread.boardId, selectedMessage.id, replyContent.trim());
      const updatedMsg = { ...selectedMessage, replies: [...selectedMessage.replies, reply] };
      setSelectedMessage(updatedMsg);
      setThreads((prev) =>
        prev.map((t) =>
          t.boardId === selectedThread.boardId
            ? { ...t, messages: t.messages.map((m) => m.id === updatedMsg.id ? updatedMsg : m) }
            : t,
        ),
      );
      setReplyContent("");
      setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), 100);
    } catch {}
    setReplying(false);
  };

  const selectedColor = selectedThread ? getBoardColorById(selectedThread.boardId) : null;

  return (
    <div className="h-full flex flex-col bg-white">
      <Header backHref="/" />
      <div className="flex-1 flex overflow-hidden">
        {/* Left — conversation list */}
        <div className="w-[320px] border-r border-border flex flex-col shrink-0 bg-white">
          <div className="px-5 pt-5 pb-3">
            <h1 className="text-lg font-bold text-ink">Inbox</h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center gap-2 py-16 justify-center">
                <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />
                <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }} />
                <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }} />
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-16 px-6">
                <p className="text-sm text-ink-tertiary">No messages yet</p>
              </div>
            ) : (
              threads.map((thread) => {
                const latest = thread.messages[0];
                const isSelected = selectedThread?.boardId === thread.boardId;
                const threadColor = getBoardColorById(thread.boardId);
                const msgCount = thread.messages.length;

                return (
                  <button
                    key={thread.boardId}
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full text-left px-4 py-3.5 border-b border-border transition-all duration-150 ${
                      isSelected ? "bg-surface" : "hover:bg-surface/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Board color avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: threadColor.hex }}
                      >
                        {thread.boardTitle.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[13px] font-semibold text-ink truncate">{thread.boardTitle}</span>
                          <span className="text-[10px] text-ink-tertiary shrink-0 ml-2">{timeAgo(thread.lastMessageAt)}</span>
                        </div>
                        <p className="text-[12px] text-ink-secondary truncate">
                          {latest?.senderName}: {latest?.content}
                        </p>
                        {msgCount > 1 && (
                          <span className="text-[10px] text-ink-tertiary">{msgCount} messages</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right — conversation view */}
        <div className="flex-1 flex flex-col bg-white">
          {!selectedThread || !selectedColor ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-tertiary">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-ink-tertiary">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation header with board color */}
              <div style={{ backgroundColor: selectedColor.hex }} className="h-1" />
              <div className="px-6 py-3.5 border-b border-border flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  {selectedThread.boardTitle.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-ink">{selectedThread.boardTitle}</h2>
                  <p className="text-[11px] text-ink-tertiary">{selectedThread.messages.length} messages</p>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-surface/20">
                {selectedThread.messages.map((msg, i) => {
                  const prevDate = i > 0 ? formatDate(selectedThread.messages[i - 1].createdAt) : null;
                  const thisDate = formatDate(msg.createdAt);
                  const showDate = thisDate !== prevDate;
                  const isActive = selectedMessage?.id === msg.id;

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-3">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] font-medium text-ink-tertiary uppercase tracking-wider">{thisDate}</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                      )}

                      <div
                        className={`cursor-pointer transition-all duration-150 ${isActive ? "" : "opacity-70 hover:opacity-100"}`}
                        onClick={() => { setSelectedMessage(msg); setReplyContent(""); }}
                      >
                        {/* Sender message — left aligned */}
                        <div className="flex gap-2.5 items-start">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{ backgroundColor: selectedColor.hex }}
                          >
                            {msg.senderName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-[13px] font-semibold text-ink">{msg.senderName}</span>
                              <span className="text-[10px] text-ink-tertiary">{formatTime(msg.createdAt)}</span>
                            </div>
                            <div className="bg-white border border-border rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm inline-block max-w-[90%]">
                              <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        </div>

                        {/* Replies — right aligned */}
                        {msg.replies.map((r) => (
                          <div key={r.id} className="flex justify-end mt-2">
                            <div className="max-w-[80%]">
                              <div
                                className="rounded-2xl rounded-tr-md px-3.5 py-2.5 shadow-sm"
                                style={{ backgroundColor: selectedColor.hexLight }}
                              >
                                <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{r.content}</p>
                              </div>
                              <p className="text-[10px] text-ink-tertiary mt-0.5 text-right pr-1">{formatTime(r.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply bar */}
              {selectedMessage && (
                <div className="px-5 py-3 border-t border-border bg-white">
                  <div className="flex gap-2 items-end">
                    <input
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${selectedMessage.senderName}...`}
                      className="flex-1 border border-border rounded-xl px-4 py-2.5 text-[13px] text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }
                      }}
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || replying}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all duration-150 active:scale-[0.95] shrink-0"
                      style={{ backgroundColor: selectedColor.hex }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
