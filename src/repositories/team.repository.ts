import { prisma } from "@/lib/prisma";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const teamRepository = {
  findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        members: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      },
    });
  },

  findByInviteCode(inviteCode: string) {
    return prisma.team.findUnique({ where: { inviteCode } });
  },

  async create(name: string, adminId: string) {
    // Generate a unique invite code
    let inviteCode = generateInviteCode();
    while (await prisma.team.findUnique({ where: { inviteCode } })) {
      inviteCode = generateInviteCode();
    }

    // Create team and set the admin's role + teamId in one transaction
    const team = await prisma.team.create({
      data: { name, inviteCode, adminId },
    });

    await prisma.user.update({
      where: { id: adminId },
      data: { role: "admin", teamId: team.id },
    });

    return team;
  },

  regenerateInviteCode(id: string) {
    const newCode = generateInviteCode();
    return prisma.team.update({
      where: { id },
      data: { inviteCode: newCode },
    });
  },

  addMember(teamId: string, userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { teamId, role: "employee" },
    });
  },

  removeMember(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { teamId: null },
    });
  },
};
