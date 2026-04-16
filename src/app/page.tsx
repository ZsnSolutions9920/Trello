"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/board/Header";
import { AttendanceModal } from "@/components/AttendanceModal";
import { AttendanceStatusBanner } from "@/components/home/AttendanceStatusBanner";
import { BoardsPanel } from "@/components/home/BoardsPanel";
import { api } from "@/lib/api";
import type { AttendanceRecord, BoardSummary } from "@/types";
import { useAuthStore } from "@/store/auth.store";

type AttendanceStatus = "not_signed_in" | "signed_in" | "signed_out" | "loading";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("loading");
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [shiftDuration, setShiftDuration] = useState("00:00:00");
  const canManageBoards = user?.role === "admin";

  const formatShiftDuration = (value: string) => {
    const diffMs = Math.max(0, Date.now() - new Date(value).getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((part) => String(part).padStart(2, "0"))
      .join(":");
  };

  // Fetch attendance status on load
  const fetchAttendance = useCallback(async () => {
    try {
      const { status, record } = await api.attendance.status();
      setAttendanceStatus(status);
      setAttendanceRecord(record);
    } catch {
      setAttendanceStatus("not_signed_in");
      setAttendanceRecord(null);
    }
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  useEffect(() => {
    if (attendanceStatus !== "signed_in" || !attendanceRecord) {
      setShiftDuration("00:00:00");
      return;
    }

    setShiftDuration(formatShiftDuration(attendanceRecord.signInAt));

    const intervalId = window.setInterval(() => {
      setShiftDuration(formatShiftDuration(attendanceRecord.signInAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [attendanceRecord, attendanceStatus]);

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
    setBoards((currentBoards) => [board, ...currentBoards]);
    setNewTitle("");
    setShowForm(false);
  };

  const handleDelete = async (e: React.MouseEvent, boardId: string) => {
    if (!canManageBoards) return;
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this board and all its data?")) return;
    await api.boards.delete(boardId);
    setBoards((currentBoards) => currentBoards.filter((board) => board.id !== boardId));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-10 sm:py-10 animate-fade-in-up">
        <h1 className="mb-2 text-3xl font-black tracking-tight text-ink sm:text-5xl">
          Your Projects
        </h1>
        <p className="mb-6 text-base text-ink-secondary sm:text-lg">
          Organize anything. Keep it simple.
        </p>

        {attendanceStatus === "not_signed_in" && (
          <div className="mb-8">
            <AttendanceStatusBanner
              status="not_signed_in"
              onOpen={() => setShowAttendance(true)}
            />
          </div>
        )}

        {attendanceStatus === "signed_in" && (
          <div className="mb-8">
            <AttendanceStatusBanner
              status="signed_in"
              shiftDuration={shiftDuration}
              onOpen={() => setShowAttendance(true)}
            />
          </div>
        )}

        <BoardsPanel
          boards={boards}
          canManageBoards={canManageBoards}
          loading={loading}
          newTitle={newTitle}
          showForm={showForm}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onNewTitleChange={setNewTitle}
          onShowFormChange={setShowForm}
        />
      </main>

      {attendanceStatus !== "loading" && attendanceStatus !== "signed_out" && (
        <AttendanceModal
          isOpen={showAttendance}
          onClose={() => setShowAttendance(false)}
          status={attendanceStatus}
          onStatusChange={(status, record) => {
            setAttendanceStatus(status);
            setAttendanceRecord(status === "signed_in" ? record : null);
          }}
        />
      )}
    </div>
  );
}
