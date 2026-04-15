import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { messageService } from "@/services/message.service";
import { errorResponse } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const threads = await messageService.getInboxForUser(userId);
    // Force JSON serialization of Date objects
    return new NextResponse(JSON.stringify(threads), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Inbox error:", error);
    return errorResponse(error);
  }
}
