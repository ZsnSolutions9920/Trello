import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { errorResponse } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const user = await userRepository.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamId,
      discordConnected: !!user.discordId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
