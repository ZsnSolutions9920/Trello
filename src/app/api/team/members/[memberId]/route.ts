import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { teamService } from "@/services/team.service";
import { errorResponse } from "@/lib/errors";

// DELETE — remove a member from the team (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  try {
    const { memberId } = await params;
    const adminId = getAuthUserId(req);
    await teamService.removeMember(memberId, adminId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
