import { boardRepository } from "@/repositories/board.repository";
import { messageRepository } from "@/repositories/message.repository";
import { userRepository } from "@/repositories/user.repository";
import { sendDirectMessage } from "@/lib/discord";
import { AppError } from "@/lib/errors";

export const messageService = {
  async sendContactMessage(
    boardId: string,
    senderName: string,
    senderEmail: string | undefined,
    content: string,
    senderIp: string | undefined,
  ) {
    const board = await boardRepository.findByIdWithOwner(boardId);
    if (!board) throw new AppError(404, "Board not found");
    if (!board.owner.discordId) {
      throw new AppError(422, "Board owner has not connected Discord");
    }

    const message = await messageRepository.create({
      boardId, senderName, senderEmail, content, senderIp,
    });

    const dmContent = [
      `**New message from ${senderName}**${senderEmail ? ` (${senderEmail})` : ""}`,
      `Board: ${board.title}`,
      "",
      content,
    ].join("\n");

    try {
      await sendDirectMessage(board.owner.discordId, dmContent);
      await messageRepository.updateStatus(message.id, "sent");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      await messageRepository.updateStatus(message.id, "failed", errMsg);
      throw new AppError(502, "Message could not be delivered. The board owner may not be reachable on Discord.");
    }
  },

  // Get all messages grouped by board for the inbox
  async getInboxForUser(userId: string) {
    const messages = await messageRepository.findAllForUser(userId);

    // Group by board
    const boardMap = new Map<string, {
      boardId: string;
      boardTitle: string;
      messages: typeof messages;
      lastMessageAt: string;
    }>();

    for (const msg of messages) {
      const key = msg.boardId;
      if (!boardMap.has(key)) {
        boardMap.set(key, {
          boardId: msg.boardId,
          boardTitle: msg.board.title,
          messages: [],
          lastMessageAt: msg.createdAt.toISOString(),
        });
      }
      boardMap.get(key)!.messages.push(msg);
    }

    // Sort threads by latest message first
    return Array.from(boardMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  },

  // Get messages for a specific board (owner only)
  async getMessagesForBoard(boardId: string, userId: string) {
    const board = await boardRepository.findByIdWithOwner(boardId);
    if (!board) throw new AppError(404, "Board not found");
    if (board.ownerId !== userId) throw new AppError(403, "Not your board");
    return messageRepository.findByBoard(boardId);
  },

  // Reply to a message
  async replyToMessage(messageId: string, userId: string, content: string) {
    if (!content.trim()) throw new AppError(400, "Reply cannot be empty");

    const message = await messageRepository.findById(messageId);
    if (!message) throw new AppError(404, "Message not found");
    if (message.board.ownerId !== userId) throw new AppError(403, "Not your board");

    // Check board owner has Discord connected
    const board = await boardRepository.findByIdWithOwner(message.boardId);
    if (!board?.owner.discordId) {
      throw new AppError(422, "Board owner has not connected Discord. Cannot send reply.");
    }

    const reply = await messageRepository.createReply(messageId, userId, content.trim());

    // Send reply as a personal DM to the board owner (not to any channel)
    const user = await userRepository.findById(userId);
    const userName = user?.name || user?.email || "Board owner";

    const dmContent = [
      `**Reply from ${userName}** to ${message.senderName}`,
      `Board: ${message.board.title}`,
      "",
      content.trim(),
    ].join("\n");

    sendDirectMessage(board.owner.discordId, dmContent).catch((err) =>
      console.error("Discord reply DM failed:", err),
    );

    return reply;
  },
};
