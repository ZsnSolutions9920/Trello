"use client";

import Link from "next/link";
import type { BoardSummary } from "@/types";
import { getBoardColorByIndex } from "@/lib/board-colors";
import { LoadingDots } from "@/components/ui/LoadingDots";

interface BoardsPanelProps {
  boards: BoardSummary[];
  canManageBoards: boolean;
  loading: boolean;
  newTitle: string;
  showForm: boolean;
  onCreate: () => void;
  onDelete: (e: React.MouseEvent, boardId: string) => void;
  onNewTitleChange: (value: string) => void;
  onShowFormChange: (value: boolean) => void;
}

export function BoardsPanel({
  boards,
  canManageBoards,
  loading,
  newTitle,
  showForm,
  onCreate,
  onDelete,
  onNewTitleChange,
  onShowFormChange,
}: BoardsPanelProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingDots />
      </div>
    );
  }

  if (boards.length === 0 && !showForm) {
    return (
      <div className="py-16 text-center sm:py-20">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-ink-tertiary"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </div>
        <p className="mb-6 text-base text-ink-secondary sm:text-lg">
          {canManageBoards
            ? "No boards yet. Create your first one."
            : "No boards available yet. Ask your admin to create one."}
        </p>
        {canManageBoards && (
          <button
            onClick={() => onShowFormChange(true)}
            className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-neutral-800 active:scale-[0.98]"
          >
            Create a board
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {boards.map((board, index) => (
        <Link
          key={board.id}
          href={`/board/${board.id}`}
          className={`${getBoardColorByIndex(index).card} group relative flex min-h-28 flex-col justify-end rounded-2xl p-5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:scale-[1.01]`}
        >
          <span className="drop-shadow-sm">{board.title}</span>
          {canManageBoards && (
            <button
              onClick={(event) => onDelete(event, board.id)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-xs text-white/70 transition-all duration-150 hover:bg-black/40 hover:text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Delete board"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </Link>
      ))}

      {canManageBoards &&
        (showForm ? (
          <div className="animate-fade-in-up space-y-3 rounded-2xl border-2 border-dashed border-border p-5">
            <input
              value={newTitle}
              onChange={(event) => onNewTitleChange(event.target.value)}
              placeholder="Board name"
              className="focus-ring w-full rounded-xl border border-border px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") onCreate();
                if (event.key === "Escape") {
                  onShowFormChange(false);
                  onNewTitleChange("");
                }
              }}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={onCreate}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-neutral-800 active:scale-[0.98]"
              >
                Create
              </button>
              <button
                onClick={() => {
                  onShowFormChange(false);
                  onNewTitleChange("");
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm text-ink-secondary transition-all duration-150 hover:border-ink-tertiary hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onShowFormChange(true)}
            className="flex min-h-28 items-center justify-center rounded-2xl border-2 border-dashed border-border p-5 text-sm font-medium text-ink-secondary transition-all duration-200 hover:border-ink-tertiary hover:bg-surface hover:text-ink"
          >
            + New board
          </button>
        ))}
    </div>
  );
}
