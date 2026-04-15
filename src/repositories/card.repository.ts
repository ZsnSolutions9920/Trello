import { prisma } from "@/lib/prisma";

export const cardRepository = {
  create(title: string, listId: string, position: number) {
    return prisma.card.create({
      data: { title, listId, position },
      include: { list: { select: { boardId: true } } },
    });
  },

  findById(id: string) {
    return prisma.card.findUnique({
      where: { id },
      include: { list: { select: { boardId: true } } },
    });
  },

  update(id: string, data: { title?: string; description?: string | null }) {
    return prisma.card.update({
      where: { id },
      data,
      include: { list: { select: { boardId: true } } },
    });
  },

  delete(id: string) {
    return prisma.card.delete({
      where: { id },
      include: { list: { select: { boardId: true } } },
    });
  },

  move(id: string, targetListId: string, newPosition: number) {
    return prisma.card.update({
      where: { id },
      data: { listId: targetListId, position: newPosition },
      include: { list: { select: { boardId: true } } },
    });
  },

  getMaxPosition(listId: string) {
    return prisma.card.aggregate({
      where: { listId },
      _max: { position: true },
    });
  },
};
