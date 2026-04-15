"use client";

import { useEffect } from "react";
import { getSocket, joinBoard, leaveBoard } from "@/lib/socket-client";
import { useBoardStore } from "@/store/board.store";
import { SocketEvents } from "@/types/socket-events";

export function useSocketBoard(boardId: string) {
  const fetchBoard = useBoardStore((s) => s.fetchBoard);

  useEffect(() => {
    const socket = getSocket();
    joinBoard(boardId);

    // On any board-level event, refetch the board to stay in sync.
    // This is the simplest reliable approach — granular patching
    // can be added later for performance if needed.
    const refetch = () => fetchBoard(boardId);

    socket.on(SocketEvents.LIST_CREATED, refetch);
    socket.on(SocketEvents.LIST_UPDATED, refetch);
    socket.on(SocketEvents.LIST_DELETED, refetch);
    socket.on(SocketEvents.CARD_CREATED, refetch);
    socket.on(SocketEvents.CARD_UPDATED, refetch);
    socket.on(SocketEvents.CARD_DELETED, refetch);
    socket.on(SocketEvents.CARD_MOVED, refetch);
    socket.on(SocketEvents.BOARD_UPDATED, refetch);

    // Reconnect handling
    socket.on("reconnect", refetch);

    return () => {
      leaveBoard(boardId);
      socket.off(SocketEvents.LIST_CREATED, refetch);
      socket.off(SocketEvents.LIST_UPDATED, refetch);
      socket.off(SocketEvents.LIST_DELETED, refetch);
      socket.off(SocketEvents.CARD_CREATED, refetch);
      socket.off(SocketEvents.CARD_UPDATED, refetch);
      socket.off(SocketEvents.CARD_DELETED, refetch);
      socket.off(SocketEvents.CARD_MOVED, refetch);
      socket.off(SocketEvents.BOARD_UPDATED, refetch);
      socket.off("reconnect", refetch);
    };
  }, [boardId, fetchBoard]);
}
