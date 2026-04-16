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
        className="w-[min(18rem,calc(100vw-2rem))] shrink-0 rounded-2xl border-2 border-dashed border-border bg-surface px-5 py-4 text-left text-sm font-semibold text-ink-secondary transition-all duration-200 hover:border-ink-tertiary hover:text-ink sm:w-[280px]"
      >
        + Add list
      </button>
    );
  }

  return (
    <div className="animate-fade-in-up w-[min(18rem,calc(100vw-2rem))] shrink-0 space-y-2 rounded-2xl border border-border bg-surface p-3 sm:w-[280px]">
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
      <div className="flex flex-col gap-2 sm:flex-row">
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
