"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/board/Header";
import { AttendanceHistory } from "@/components/dashboard/AttendanceHistory";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { AttendanceRecord } from "@/types";

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
      <main className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-8 sm:px-10 sm:py-10">
        <h1 className="mb-2 text-3xl font-bold text-ink">Attendance Dashboard</h1>
        <p className="mb-8 text-sm text-ink-secondary sm:text-base">
          {user?.name || user?.email}&apos;s attendance history
        </p>

        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-2xl font-bold text-ink">{stats.totalDays}</p>
            <p className="text-xs text-ink-tertiary mt-1">Total Days</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-2xl font-bold text-ink">{stats.completedDays}</p>
            <p className="text-xs text-ink-tertiary mt-1">Completed</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-2xl font-bold text-ink">{stats.avgHours}</p>
            <p className="text-xs text-ink-tertiary mt-1">Avg Hours/Day</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-2xl font-bold text-ink">{stats.thisWeekDays}</p>
            <p className="text-xs text-ink-tertiary mt-1">This Week</p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold text-ink">History</h2>
        <AttendanceHistory loading={loading} records={records} />
      </main>
    </div>
  );
}
