import { prisma } from "@/lib/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findEmployeesByEmailsInTeam(teamId: string, emails: string[]) {
    if (emails.length === 0) return Promise.resolve([]);

    return prisma.user.findMany({
      where: {
        teamId,
        role: "employee",
        email: { in: emails },
      },
      select: {
        id: true,
        email: true,
        name: true,
        discordId: true,
      },
    });
  },

  create(email: string, password: string, name?: string) {
    return prisma.user.create({
      data: { email, password, name },
    });
  },

  updateDiscordId(userId: string, discordId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { discordId, discordConnectedAt: new Date() },
    });
  },

  removeDiscordId(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { discordId: null, discordConnectedAt: null },
    });
  },
};
