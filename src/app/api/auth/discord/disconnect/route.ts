import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { errorResponse } from "@/lib/errors";

export async function DELETE(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    await userRepository.removeDiscordId(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
