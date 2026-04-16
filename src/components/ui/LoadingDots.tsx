"use client";

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={className ?? "flex items-center gap-2"}>
      <div
        className="h-2 w-2 rounded-full bg-ink-tertiary"
        style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-ink-tertiary"
        style={{ animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-ink-tertiary"
        style={{ animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }}
      />
    </div>
  );
}
