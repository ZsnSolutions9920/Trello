import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { messageService } from "@/services/message.service";
import { errorResponse, AppError } from "@/lib/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  try {
    const { messageId } = await params;
    const userId = getAuthUserId(req);
    const { content } = await req.json();

    if (!content?.trim()) throw new AppError(400, "Reply cannot be empty");

    const reply = await messageService.replyToMessage(messageId, userId, content);
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
