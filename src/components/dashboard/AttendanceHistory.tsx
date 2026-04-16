"use client";

import type { AttendanceRecord } from "@/types";
import { LoadingDots } from "@/components/ui/LoadingDots";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calcDuration(signIn: string, signOut: string): string {
  const diffMs = new Date(signOut).getTime() - new Date(signIn).getTime();
  if (diffMs <= 0) return "—";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

interface AttendanceHistoryProps {
  loading: boolean;
  records: AttendanceRecord[];
}

export function AttendanceHistory({
  loading,
  records,
}: AttendanceHistoryProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingDots />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-secondary">No attendance records yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {records.map((record) => (
          <article
            key={record.id}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {formatDate(record.date)}
                </p>
                <p className="mt-1 text-xs text-ink-tertiary">
                  {record.signOutAt ? "Completed shift" : "In progress"}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  record.signOutAt
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    record.signOutAt ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                {record.signOutAt
                  ? calcDuration(record.signInAt, record.signOutAt)
                  : "In progress"}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-tertiary">
                  Clock In
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  {formatTime(record.signInAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-tertiary">
                  Clock Out
                </dt>
                <dd
                  className={`mt-1 font-medium ${
                    record.signOutAt ? "text-ink" : "text-ink-tertiary"
                  }`}
                >
                  {record.signOutAt ? formatTime(record.signOutAt) : "—"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border sm:block">
        <div className="grid grid-cols-4 border-b border-border bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
          <span>Date</span>
          <span>Clock In</span>
          <span>Clock Out</span>
          <span>Duration</span>
        </div>

        {records.map((record) => (
          <div
            key={record.id}
            className="grid grid-cols-4 border-b border-border px-5 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-surface/50"
          >
            <span className="font-medium text-ink">{formatDate(record.date)}</span>
            <span className="text-ink">{formatTime(record.signInAt)}</span>
            <span className={record.signOutAt ? "text-ink" : "text-ink-tertiary"}>
              {record.signOutAt ? formatTime(record.signOutAt) : "—"}
            </span>
            <span
              className={
                record.signOutAt ? "font-semibold text-ink" : "text-ink-tertiary"
              }
            >
              {record.signOutAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  {calcDuration(record.signInAt, record.signOutAt)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  In progress
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
