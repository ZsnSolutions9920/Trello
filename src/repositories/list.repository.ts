import { prisma } from "@/lib/prisma";

export const listRepository = {
  findByBoard(boardId: string) {
    return prisma.list.findMany({
      where: { boardId },
      orderBy: { position: "asc" },
      include: { cards: { orderBy: { position: "asc" } } },
    });
  },

  create(title: string, boardId: string, position: number) {
    return prisma.list.create({
      data: { title, boardId, position },
      include: { cards: true },
    });
  },

  update(id: string, data: { title?: string; position?: number }) {
    return prisma.list.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.list.delete({
      where: { id },
    });
  },

  getMaxPosition(boardId: string) {
    return prisma.list.aggregate({
      where: { boardId },
      _max: { position: true },
    });
  },
};
