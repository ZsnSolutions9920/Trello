import { attendanceRepository } from "@/repositories/attendance.repository";
import { userRepository } from "@/repositories/user.repository";
import { sendAttendanceToDiscord } from "@/lib/discord";
import { appendAttendanceRow, updateAttendanceRow } from "@/lib/google-sheets";
import { AppError } from "@/lib/errors";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function calculateTotalHours(signIn: Date, signOut: Date): string {
  const diffMs = signOut.getTime() - signIn.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export const attendanceService = {
  async getStatus(userId: string) {
    const date = getTodayDate();
    const record = await attendanceRepository.findByUserAndDate(userId, date);
    if (!record) return { status: "not_signed_in" as const, record: null };
    if (!record.signOutAt) return { status: "signed_in" as const, record };
    return { status: "signed_out" as const, record };
  },

  async signIn(userId: string, photoBase64: string) {
    const date = getTodayDate();

    const existing = await attendanceRepository.findByUserAndDate(userId, date);
    if (existing) throw new AppError(409, "Already signed in today");

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const record = await attendanceRepository.signIn(userId, date);

    const userName = user.name || user.email;
    const now = new Date();
    const timeStr = formatTime(now);

    // Discord notification (non-blocking)
    sendAttendanceToDiscord(
      `**${userName}** signed in\nDate: ${date}\nTime: ${timeStr}`,
      photoBase64,
    ).catch((err) => console.error("Discord attendance failed:", err));

    // Google Sheet: append row — Date | Name | Clock In | (empty) | (empty)
    try {
      await appendAttendanceRow(date, userName, timeStr);
    } catch (err) {
      console.error("Google Sheets append failed:", err);
    }

    return record;
  },

  async signOut(userId: string, photoBase64: string) {
    const date = getTodayDate();

    const existing = await attendanceRepository.findByUserAndDate(userId, date);
    if (!existing) throw new AppError(400, "You must clcok in first");
    if (existing.signOutAt) throw new AppError(409, "Already signed out today");

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const record = await attendanceRepository.signOut(existing.id);

    const userName = user.name || user.email;
    const now = new Date();
    const timeStr = formatTime(now);
    const totalHours = calculateTotalHours(existing.signInAt, now);

    // Discord notification (non-blocking)
    sendAttendanceToDiscord(
      `**${userName}** signed out\nDate: ${date}\nTime: ${timeStr}\nTotal: ${totalHours}`,
      photoBase64,
    ).catch((err) => console.error("Discord attendance failed:", err));

    // Google Sheet: update the existing row with Clock Out + Total Hours
    try {
      await updateAttendanceRow(date, userName, timeStr, totalHours);
    } catch (err) {
      console.error("Google Sheets update failed:", err);
    }

    return record;
  },
};
