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
    <div className="bg-surface border border-border rounded-2xl w-[280px] flex-shrink-0 flex flex-col max-h-full">
      {/* List header — clean, bold */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
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
            className="font-bold text-sm text-ink cursor-pointer px-0.5 hover:text-accent transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {list.title}
          </h3>
        )}
        {/* Card count + delete */}
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

      {/* Cards container */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto px-3 pb-1 space-y-2 min-h-[4px] scrollbar-thin">
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

      {/* Add card — bottom of list */}
      <div className="px-3 pb-3 pt-1">
        <AddCardForm listId={list.id} />
      </div>
    </div>
  );
}
