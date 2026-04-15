import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { teamService } from "@/services/team.service";
import { userRepository } from "@/repositories/user.repository";
import { errorResponse } from "@/lib/errors";

// POST — regenerate invite code (admin only)
export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const user = await userRepository.findById(userId);
    if (!user?.teamId) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }
    const team = await teamService.regenerateInviteCode(user.teamId, userId);
    return NextResponse.json({ inviteCode: team.inviteCode });
  } catch (error) {
    return errorResponse(error);
  }
}
