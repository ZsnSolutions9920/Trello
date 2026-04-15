import { prisma } from "@/lib/prisma";

export const boardRepository = {
  findAllByUser(userId: string) {
    return prisma.board.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.board.findUnique({
      where: { id },
    });
  },

  findByIdWithOwner(id: string) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        owner: { select: { discordId: true } },
      },
    });
  },

  findByIdWithLists(id: string) {
    return prisma.board.findUnique({
      where: { id },
      include: {
        owner: { select: { discordId: true } },
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });
  },

  create(title: string, ownerId: string, teamId?: string | null) {
    return prisma.board.create({
      data: {
        title,
        ownerId,
        teamId: teamId ?? null,
        lists: {
          create: [
            { title: "To-dos", position: 65536 },
            { title: "In-progress", position: 131072 },
            { title: "Completed", position: 196608 },
          ],
        },
      },
    });
  },

  update(id: string, title: string) {
    return prisma.board.update({
      where: { id },
      data: { title },
    });
  },

  delete(id: string) {
    return prisma.board.delete({
      where: { id },
    });
  },
};
