"use client";

type AttendanceBannerProps = {
  status: "not_signed_in" | "signed_in";
  shiftDuration?: string;
  onOpen: () => void;
};

export function AttendanceStatusBanner({
  status,
  shiftDuration,
  onOpen,
}: AttendanceBannerProps) {
  if (status === "not_signed_in") {
    return (
      <div className="animate-fade-in-up rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D97706"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                You haven&apos;t clocked in today
              </p>
              <p className="text-xs text-amber-700">
                Mark your attendance to get started.
              </p>
            </div>
          </div>
          <button
            onClick={onOpen}
            className="w-full shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-amber-700 active:scale-[0.97] sm:w-auto"
          >
            Clock In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              You&apos;re signed in today
            </p>
            <p className="text-xs text-emerald-700">
              Time on shift: {shiftDuration ?? "00:00:00"}
            </p>
          </div>
        </div>
        <button
          onClick={onOpen}
          className="w-full shrink-0 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all duration-150 hover:bg-emerald-100 active:scale-[0.97] sm:w-auto"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
