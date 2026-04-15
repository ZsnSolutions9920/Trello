import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { teamService } from "@/services/team.service";
import { errorResponse } from "@/lib/errors";

// GET — get current user's team
export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const team = await teamService.getTeam(userId);
    return NextResponse.json(team);
  } catch (error) {
    return errorResponse(error);
  }
}

// POST — create a new team (user becomes admin)
export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const { name } = await req.json();
    const team = await teamService.create(name, userId);
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
