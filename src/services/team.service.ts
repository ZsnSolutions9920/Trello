import { teamRepository } from "@/repositories/team.repository";
import { userRepository } from "@/repositories/user.repository";
import { AppError } from "@/lib/errors";

export const teamService = {
  async create(name: string, adminId: string) {
    if (!name.trim()) throw new AppError(400, "Team name is required");

    // Check user doesn't already belong to a team
    const user = await userRepository.findById(adminId);
    if (user?.teamId) throw new AppError(409, "You already belong to a team");

    return teamRepository.create(name.trim(), adminId);
  },

  async getTeam(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user?.teamId) return null;
    return teamRepository.findById(user.teamId);
  },

  async joinByInviteCode(inviteCode: string, userId: string) {
    if (!inviteCode.trim()) throw new AppError(400, "Invite code is required");

    const user = await userRepository.findById(userId);
    if (user?.teamId) throw new AppError(409, "You already belong to a team");

    const team = await teamRepository.findByInviteCode(inviteCode.trim().toUpperCase());
    if (!team) throw new AppError(404, "Invalid invite code");

    await teamRepository.addMember(team.id, userId);
    return team;
  },

  async regenerateInviteCode(teamId: string, userId: string) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new AppError(404, "Team not found");
    if (team.adminId !== userId) throw new AppError(403, "Only the admin can regenerate invite codes");

    return teamRepository.regenerateInviteCode(teamId);
  },

  async removeMember(memberId: string, adminId: string) {
    const admin = await userRepository.findById(adminId);
    if (!admin?.teamId) throw new AppError(403, "You don't belong to a team");

    const team = await teamRepository.findById(admin.teamId);
    if (!team || team.adminId !== adminId) throw new AppError(403, "Only the admin can remove members");

    if (memberId === adminId) throw new AppError(400, "Admin cannot remove themselves");

    const member = await userRepository.findById(memberId);
    if (!member || member.teamId !== admin.teamId) throw new AppError(404, "Member not found in your team");

    await teamRepository.removeMember(memberId);
  },
};
