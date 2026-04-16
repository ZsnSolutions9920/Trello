"use client";

import { useState } from "react";
import type { Card, List } from "@/types";
import { useBoardStore } from "@/store/board.store";
import { BoardCard } from "./BoardCard";
import { AddCardForm } from "./AddCardForm";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface Props {
  list: List;
  onOpenCardDetail: (card: Card, listTitle: string) => void;
}

export function BoardList({ list, onOpenCardDetail }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const { updateList, deleteList } = useBoardStore();

  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
    data: { type: "list", listId: list.id },
  });

  const handleSave = () => {
    if (title.trim() && title !== list.title) {
      updateList(list.id, title.trim());
    } else {
      setTitle(list.title);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex max-h-full w-[min(18rem,calc(100vw-2rem))] shrink-0 snap-start flex-col rounded-2xl border border-border bg-surface sm:w-[280px]">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setTitle(list.title);
                setIsEditing(false);
              }
            }}
            className="focus-ring font-bold text-sm bg-white rounded-lg border border-border px-2.5 py-1.5 w-full text-ink"
            autoFocus
          />
        ) : (
          <h3
            className="cursor-pointer px-0.5 text-sm font-bold text-ink transition-colors hover:text-accent"
            onClick={() => setIsEditing(true)}
          >
            {list.title}
          </h3>
        )}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-ink-tertiary tabular-nums">
            {list.cards.length}
          </span>
          <button
            onClick={() => deleteList(list.id)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-ink-tertiary hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            aria-label="Delete list"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="scrollbar-thin min-h-[4px] flex-1 space-y-2 overflow-y-auto px-3 pb-1"
      >
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              listId={list.id}
              onOpenDetail={(c) => onOpenCardDetail(c, list.title)}
            />
          ))}
        </SortableContext>
      </div>

      <div className="px-3 pb-3 pt-1">
        <AddCardForm listId={list.id} />
      </div>
    </div>
  );
}
