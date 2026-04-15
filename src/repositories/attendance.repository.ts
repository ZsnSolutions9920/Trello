import { prisma } from "@/lib/prisma";

export const attendanceRepository = {
  findByUserAndDate(userId: string, date: string) {
    return prisma.attendance.findUnique({
      where: { userId_date: { userId, date } },
    });
  },

  signIn(userId: string, date: string) {
    return prisma.attendance.create({
      data: { userId, date, signInAt: new Date() },
    });
  },

  signOut(id: string) {
    return prisma.attendance.update({
      where: { id },
      data: { signOutAt: new Date() },
    });
  },

  findAllByUser(userId: string) {
    return prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  },
};
