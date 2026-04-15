import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export function getSocketServer(httpServer?: HttpServer): SocketServer {
  if (io) return io;
  if (!httpServer) throw new Error("Socket server not initialized");

  io = new SocketServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // Join a board room for scoped updates
    socket.on("join-board", (boardId: string) => {
      socket.join(`board:${boardId}`);
    });

    socket.on("leave-board", (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on("disconnect", () => {
      // cleanup handled by socket.io
    });
  });

  return io;
}

// Emit helpers — called from API routes
export function emitBoardEvent(boardId: string, event: string, data: unknown) {
  if (!io) return;
  io.to(`board:${boardId}`).emit(event, data);
}
