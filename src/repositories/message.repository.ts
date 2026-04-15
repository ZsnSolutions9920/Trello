import { prisma } from "@/lib/prisma";

export const messageRepository = {
  create(data: {
    boardId: string;
    senderName: string;
    senderEmail?: string;
    content: string;
    senderIp?: string;
  }) {
    return prisma.contactMessage.create({ data });
  },

  updateStatus(id: string, deliveryStatus: string, deliveryError?: string) {
    return prisma.contactMessage.update({
      where: { id },
      data: { deliveryStatus, deliveryError },
    });
  },

  findById(id: string) {
    return prisma.contactMessage.findUnique({
      where: { id },
      include: {
        board: { select: { title: true, ownerId: true } },
        replies: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  findByBoard(boardId: string) {
    return prisma.contactMessage.findMany({
      where: { boardId },
      include: { replies: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  },

  // All messages across all boards owned by this user
  findAllForUser(userId: string) {
    return prisma.contactMessage.findMany({
      where: { board: { ownerId: userId } },
      include: {
        board: { select: { id: true, title: true } },
        replies: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  createReply(contactMessageId: string, userId: string, content: string) {
    return prisma.messageReply.create({
      data: { contactMessageId, userId, content },
    });
  },
};
