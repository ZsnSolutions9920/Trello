"use client";

import { useState } from "react";
import type { Card } from "@/types";
import { useBoardStore } from "@/store/board.store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  card: Card;
  listId: string;
  onOpenDetail: (card: Card) => void;
}

export function BoardCard({ card, listId, onOpenDetail }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const { updateCard, deleteCard } = useBoardStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card, listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleSave = () => {
    if (title.trim() && title !== card.title) {
      updateCard(card.id, { title: title.trim() });
    } else {
      setTitle(card.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-xl border border-border/60 bg-white px-3.5 py-2.5 transition-all duration-150 active:cursor-grabbing ${
        isDragging
          ? "shadow-lg scale-[1.02] rotate-[1deg]"
          : "shadow-none hover:shadow-md hover:-translate-y-px"
      }`}
      onClick={() => {
        if (!isEditing) onOpenDetail(card);
      }}
    >
      {isEditing ? (
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
            if (e.key === "Escape") {
              setTitle(card.title);
              setIsEditing(false);
            }
          }}
          className="focus-ring w-full resize-none rounded-lg border border-border px-2 py-1 text-sm text-ink"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-ink leading-snug flex-1">
            {card.title}
          </span>
          <div className="mr-[-0.25rem] flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-md text-ink-tertiary hover:text-ink hover:bg-surface transition-colors"
              title="Edit"
              aria-label="Edit card"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCard(card.id, listId);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-md text-ink-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
              aria-label="Delete card"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
