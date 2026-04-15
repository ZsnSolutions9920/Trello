import { commentRepository } from "@/repositories/comment.repository";
import { userRepository } from "@/repositories/user.repository";
import { sendDirectMessage } from "@/lib/discord";
import { AppError } from "@/lib/errors";

function extractMentionedEmails(content: string): string[] {
  const matches = content.match(/@([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g) || [];
  const emails = matches.map((m) => m.slice(1).toLowerCase());
  return Array.from(new Set(emails));
}

export const commentService = {
  async getByCard(cardId: string) {
    return commentRepository.findByCard(cardId);
  },

  async create(content: string, cardId: string, userId: string) {
    if (!content.trim()) throw new AppError(400, "Content is required");
    const trimmed = content.trim();

    const author = await userRepository.findById(userId);
    if (!author) throw new AppError(404, "User not found");

    const card = await commentRepository.findCardContext(cardId);
    if (!card) throw new AppError(404, "Card not found");

    const comment = await commentRepository.create(trimmed, cardId, userId);

    const mentionedEmails = extractMentionedEmails(trimmed);
    if (mentionedEmails.length === 0 || !author.teamId) return comment;

    const mentionedEmployees = await userRepository.findEmployeesByEmailsInTeam(
      author.teamId,
      mentionedEmails,
    );

    const targets = mentionedEmployees.filter(
      (employee) => employee.id !== userId && !!employee.discordId,
    );

    if (targets.length === 0) return comment;

    const authorName = author.name || author.email;
    const boardPath = `/board/${card.list.board.id}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    const boardUrl = baseUrl ? `${baseUrl}${boardPath}` : boardPath;

    const delivery = await Promise.allSettled(
      targets.map((target) => {
        const dm = [
          `You were tagged by **${authorName}**`,
          `Board: ${card.list.board.title}`,
          `Card: ${card.title}`,
          "",
          `Comment: ${trimmed}`,
          "",
          `Open board: ${boardUrl}`,
        ].join("\n");

        return sendDirectMessage(target.discordId!, dm);
      }),
    );

    delivery.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Tagged mention Discord DM failed:", result.reason);
      }
    });

    return comment;
  },

  async delete(id: string) {
    return commentRepository.delete(id);
  },
};
