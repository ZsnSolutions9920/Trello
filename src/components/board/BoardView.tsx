"use client";

import { useEffect, useCallback, useState } from "react";
import { useBoardStore } from "@/store/board.store";
import { useSocketBoard } from "@/hooks/useSocketBoard";
import { BoardList } from "./BoardList";
import { AddListForm } from "./AddListForm";
import { CardDetailModal } from "./CardDetailModal";
import type { Card } from "@/types";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

interface Props {
  boardId: string;
}

export function BoardView({ boardId }: Props) {
  const { board, loading, error, fetchBoard, moveCard, reorderCardInList, commitMoveCard } =
    useBoardStore();

  const [detailCard, setDetailCard] = useState<Card | null>(null);
  const [detailListTitle, setDetailListTitle] = useState("");

  useSocketBoard(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  useEffect(() => {
    fetchBoard(boardId);
  }, [boardId, fetchBoard]);

  const findListIdByCardId = useCallback(
    (cardId: string): string | null => {
      if (!board) return null;
      for (const list of board.lists) {
        if (list.cards.some((c) => c.id === cardId)) return list.id;
      }
      return null;
    },
    [board],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !board || active.id === over.id) return;

      const activeData = active.data.current;
      if (activeData?.type !== "card") return;

      const activeCardId = active.id as string;
      const sourceListId = findListIdByCardId(activeCardId);
      if (!sourceListId) return;

      const overData = over.data.current;
      let targetListId: string;

      if (overData?.type === "card") {
        targetListId = findListIdByCardId(over.id as string) || sourceListId;
      } else if (overData?.type === "list") {
        targetListId = overData.listId;
      } else {
        const overId = over.id as string;
        if (overId.startsWith("list-")) {
          targetListId = overId.replace("list-", "");
        } else {
          return;
        }
      }

      // Same list — reorder within list
      if (sourceListId === targetListId && overData?.type === "card") {
        reorderCardInList(sourceListId, activeCardId, over.id as string);
        return;
      }

      // Different list — move card across lists
      if (sourceListId !== targetListId) {
        const targetList = board.lists.find((l) => l.id === targetListId);
        const newPosition = targetList?.cards.length
          ? targetList.cards[targetList.cards.length - 1].position + 65536
          : 65536;
        moveCard(activeCardId, sourceListId, targetListId, newPosition);
      }
    },
    [board, findListIdByCardId, moveCard, reorderCardInList],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || !board) return;

      const activeData = active.data.current;
      if (activeData?.type !== "card") return;

      const activeCardId = active.id as string;
      const targetListId = findListIdByCardId(activeCardId);
      if (!targetListId) return;

      const targetList = board.lists.find((l) => l.id === targetListId);
      if (!targetList) return;

      const cardIndex = targetList.cards.findIndex((c) => c.id === activeCardId);
      let newPosition: number;

      if (targetList.cards.length <= 1) {
        newPosition = 65536;
      } else if (cardIndex === 0) {
        newPosition = targetList.cards[1].position / 2;
      } else if (cardIndex === targetList.cards.length - 1) {
        newPosition = targetList.cards[cardIndex - 1].position + 65536;
      } else {
        const before = targetList.cards[cardIndex - 1].position;
        const after = targetList.cards[cardIndex + 1].position;
        newPosition = (before + after) / 2;
      }

      commitMoveCard(activeCardId, targetListId, newPosition);
    },
    [board, findListIdByCardId, commitMoveCard],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />
          <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }} />
          <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!board) return null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full overflow-x-auto scrollbar-thin">
          <div className="flex gap-5 px-6 py-5 h-full items-start justify-center min-w-fit mx-auto animate-fade-in">
            {board.lists.map((list) => (
              <BoardList
                key={list.id}
                list={list}
                onOpenCardDetail={(card, listTitle) => {
                  setDetailCard(card);
                  setDetailListTitle(listTitle);
                }}
              />
            ))}
            <AddListForm />
          </div>
        </div>
      </DndContext>

      <CardDetailModal
        card={detailCard}
        listTitle={detailListTitle}
        onClose={() => setDetailCard(null)}
      />
    </>
  );
}
