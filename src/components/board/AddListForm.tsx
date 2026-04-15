"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/board.store";

export function AddListForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const addList = useBoardStore((s) => s.addList);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addList(title.trim());
    setTitle("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-surface border-2 border-dashed border-border hover:border-ink-tertiary text-ink-secondary hover:text-ink rounded-2xl w-[280px] flex-shrink-0 px-5 py-4 text-sm font-semibold text-left transition-all duration-200"
      >
        + Add list
      </button>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl w-[280px] flex-shrink-0 p-3 space-y-2 animate-fade-in-up">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="List name"
        className="focus-ring w-full rounded-xl border border-border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-tertiary transition-colors hover:border-ink-tertiary focus:border-ink"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
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
