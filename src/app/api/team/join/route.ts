import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { teamService } from "@/services/team.service";
import { errorResponse } from "@/lib/errors";

// POST — join a team via invite code
export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const { inviteCode } = await req.json();
    const team = await teamService.joinByInviteCode(inviteCode, userId);
    return NextResponse.json(team);
  } catch (error) {
    return errorResponse(error);
  }
}
