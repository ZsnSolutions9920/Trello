"use client";

import { use, useState } from "react";
import { Header } from "@/components/board/Header";
import { BoardView } from "@/components/board/BoardView";
import { ContactOwnerModal } from "@/components/board/ContactOwnerModal";
import { useBoardStore } from "@/store/board.store";
import { getBoardColorById } from "@/lib/board-colors";

export default function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const board = useBoardStore((s) => s.board);
  const color = getBoardColorById(id);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white">
      <Header
        title={board?.title || "Board"}
        backHref="/"
        accentColor={color.accent}
      >
        {board?.ownerDiscordConnected && (
          <button
            onClick={() => setShowContact(true)}
            className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface transition-all duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message
          </button>
        )}
      </Header>
      <div className="flex-1 overflow-hidden">
        <BoardView boardId={id} />
      </div>

      <ContactOwnerModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        boardId={id}
      />
    </div>
  );
}
