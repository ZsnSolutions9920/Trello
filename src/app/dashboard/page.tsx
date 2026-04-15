"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/board/Header";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { AttendanceRecord } from "@/types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calcDuration(signIn: string, signOut: string): string {
  const diffMs = new Date(signOut).getTime() - new Date(signIn).getTime();
  if (diffMs <= 0) return "—";
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${h}h ${m}m`;
}

function calcAverage(records: AttendanceRecord[]): string {
  const completed = records.filter((r) => r.signOutAt);
  if (completed.length === 0) return "—";
  const totalMs = completed.reduce((sum, r) => {
    return sum + (new Date(r.signOutAt!).getTime() - new Date(r.signInAt).getTime());
  }, 0);
  const avgMs = totalMs / completed.length;
  const h = Math.floor(avgMs / (1000 * 60 * 60));
  const m = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${h}h ${m}m`;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.attendance
      .history()
      .then(setRecords)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Stats
  const stats = useMemo(() => {
    const totalDays = records.length;
    const completedDays = records.filter((r) => r.signOutAt).length;
    const avgHours = calcAverage(records);

    // This week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStr = weekStart.toISOString().split("T")[0];
    const thisWeek = records.filter((r) => r.date >= weekStr);

    return { totalDays, completedDays, avgHours, thisWeekDays: thisWeek.length };
  }, [records]);

  return (
    <div className="h-full flex flex-col bg-white">
      <Header backHref="/" />
      <main className="flex-1 px-6 sm:px-10 py-10 max-w-4xl mx-auto w-full overflow-y-auto">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-ink mb-2">Attendance Dashboard</h1>
        <p className="text-ink-secondary mb-8">
          {user?.name || user?.email}&apos;s attendance history
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-2xl font-bold text-ink">{stats.totalDays}</p>
            <p className="text-xs text-ink-tertiary mt-1">Total Days</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-2xl font-bold text-ink">{stats.completedDays}</p>
            <p className="text-xs text-ink-tertiary mt-1">Completed</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-2xl font-bold text-ink">{stats.avgHours}</p>
            <p className="text-xs text-ink-tertiary mt-1">Avg Hours/Day</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <p className="text-2xl font-bold text-ink">{stats.thisWeekDays}</p>
            <p className="text-xs text-ink-tertiary mt-1">This Week</p>
          </div>
        </div>

        {/* History table */}
        <h2 className="text-lg font-bold text-ink mb-4">History</h2>

        {loading ? (
          <div className="flex items-center gap-2 py-12 justify-center">
            <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />
            <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }} />
            <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }} />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-secondary">No attendance records yet.</p>
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-surface px-5 py-3 text-xs font-semibold text-ink-tertiary uppercase tracking-wider border-b border-border">
              <span>Date</span>
              <span>Clock In</span>
              <span>Clock Out</span>
              <span>Duration</span>
            </div>

            {/* Table rows */}
            {records.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-4 px-5 py-3.5 text-sm border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors"
              >
                <span className="text-ink font-medium">{formatDate(r.date)}</span>
                <span className="text-ink">{formatTime(r.signInAt)}</span>
                <span className={r.signOutAt ? "text-ink" : "text-ink-tertiary"}>
                  {r.signOutAt ? formatTime(r.signOutAt) : "—"}
                </span>
                <span className={r.signOutAt ? "text-ink font-semibold" : "text-ink-tertiary"}>
                  {r.signOutAt ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      {calcDuration(r.signInAt, r.signOutAt)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      In progress
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
