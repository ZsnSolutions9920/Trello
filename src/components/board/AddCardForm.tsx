"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/board.store";

interface Props {
  listId: string;
}

export function AddCardForm({ listId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const addCard = useBoardStore((s) => s.addCard);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addCard(title.trim(), listId);
    setTitle("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left text-sm text-ink-tertiary hover:text-ink rounded-xl px-3 py-2 transition-all duration-150 hover:bg-black/[0.03] font-medium"
      >
        + Add a card
      </button>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in-up">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="focus-ring w-full resize-none rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
        rows={2}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape") {
            setIsOpen(false);
            setTitle("");
          }
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-black text-white text-sm px-3.5 py-1.5 rounded-lg font-semibold hover:bg-neutral-800 transition-all duration-150 active:scale-[0.97]"
        >
          Add
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
          className="text-ink-secondary text-sm px-3 py-1.5 border border-border rounded-lg hover:text-ink hover:border-ink-tertiary transition-all duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
