"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io({
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  return socket;
}

export function joinBoard(boardId: string) {
  const s = getSocket();
  s.emit("join-board", boardId);
}

export function leaveBoard(boardId: string) {
  const s = getSocket();
  s.emit("leave-board", boardId);
}
