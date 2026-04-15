"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/board/Header";
import { AttendanceModal } from "@/components/AttendanceModal";
import { api } from "@/lib/api";
import type { BoardSummary } from "@/types";
import { useAuthStore } from "@/store/auth.store";

import { getBoardColorByIndex } from "@/lib/board-colors";

type AttendanceStatus = "not_signed_in" | "signed_in" | "signed_out" | "loading";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("loading");
  const [showAttendance, setShowAttendance] = useState(false);
  const canManageBoards = user?.role === "admin";

  // Fetch attendance status on load
  const fetchAttendance = useCallback(async () => {
    try {
      const { status } = await api.attendance.status();
      setAttendanceStatus(status);
    } catch {
      setAttendanceStatus("not_signed_in");
    }
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  useEffect(() => {
    api.boards
      .list()
      .then((data) => {
        setBoards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!canManageBoards) return;
    if (!newTitle.trim()) return;
    const board = await api.boards.create(newTitle.trim());
    setBoards([board, ...boards]);
    setNewTitle("");
    setShowForm(false);
  };

  const handleDelete = async (e: React.MouseEvent, boardId: string) => {
    if (!canManageBoards) return;
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this board and all its data?")) return;
    await api.boards.delete(boardId);
    setBoards(boards.filter((b) => b.id !== boardId));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <Header />
      <main className="flex-1 px-6 sm:px-10 py-10 max-w-6xl mx-auto w-full animate-fade-in-up">
        {/* Big bold heading — Gumroad-style */}
        <h1 className="text-4xl sm:text-5xl font-black text-ink tracking-tight mb-2">
          Your boards
        </h1>
        <p className="text-ink-secondary text-lg mb-6">
          Organize anything. Keep it simple.
        </p>

        {/* Attendance reminder banner */}
        {attendanceStatus === "not_signed_in" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 flex items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">You haven't clocked in today</p>
                <p className="text-xs text-amber-700">Mark your attendance to get started.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAttendance(true)}
              className="bg-amber-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-all duration-150 active:scale-[0.97] shrink-0"
            >
              Clock In
            </button>
          </div>
        )}

        {/* Attendance action — signed in, can sign out */}
        {attendanceStatus === "signed_in" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-8 flex items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">You're signed in today</p>
                <p className="text-xs text-emerald-700">Don't forget to sign out when you leave.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAttendance(true)}
              className="text-sm px-4 py-2 border border-emerald-300 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-100 transition-all duration-150 active:scale-[0.97] shrink-0"
            >
              Sign Out
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center">
            <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />
            <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }} />
            <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }} />
          </div>
        ) : boards.length === 0 && !showForm ? (
          /* Empty state — clean and inviting */
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-tertiary">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <p className="text-ink-secondary text-lg mb-6">
              {canManageBoards
                ? "No boards yet. Create your first one."
                : "No boards available yet. Ask your admin to create one."}
            </p>
            {canManageBoards && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.98]"
              >
                Create a board
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {boards.map((board, i) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className={`${getBoardColorByIndex(i).card} rounded-2xl p-5 h-28 flex flex-col justify-end text-white font-bold text-base shadow-sm relative group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5`}
              >
                <span className="drop-shadow-sm">{board.title}</span>
                {canManageBoards && (
                  <button
                    onClick={(e) => handleDelete(e, board.id)}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-black/20 text-white/70 hover:bg-black/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-150 text-xs"
                    aria-label="Delete board"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </Link>
            ))}

            {/* Create board — inline form or trigger */}
            {canManageBoards && (
              showForm ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-5 space-y-3 animate-fade-in-up">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Board name"
                    className="focus-ring w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") {
                        setShowForm(false);
                        setNewTitle("");
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreate}
                      className="bg-black text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.98]"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setNewTitle("");
                      }}
                      className="text-ink-secondary text-sm px-3 py-2 border border-border rounded-lg hover:text-ink hover:border-ink-tertiary transition-all duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-2xl border-2 border-dashed border-border p-5 h-28 flex items-center justify-center text-sm text-ink-secondary font-medium transition-all duration-200 hover:border-ink-tertiary hover:text-ink hover:bg-surface"
                >
                  + New board
                </button>
              )
            )}
          </div>
        )}
      </main>

      {/* Attendance modal */}
      {attendanceStatus !== "loading" && attendanceStatus !== "signed_out" && (
        <AttendanceModal
          isOpen={showAttendance}
          onClose={() => setShowAttendance(false)}
          status={attendanceStatus}
          onStatusChange={(s) => setAttendanceStatus(s)}
        />
      )}
    </div>
  );
}
