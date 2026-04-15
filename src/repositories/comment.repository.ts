import { prisma } from "@/lib/prisma";

export const commentRepository = {
  findByCard(cardId: string) {
    return prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
    });
  },

  create(content: string, cardId: string, userId: string) {
    return prisma.comment.create({
      data: { content, cardId, userId },
    });
  },

  findCardContext(cardId: string) {
    return prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        title: true,
        list: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                id: true,
                title: true,
                teamId: true,
              },
            },
          },
        },
      },
    });
  },

  delete(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  },
};
