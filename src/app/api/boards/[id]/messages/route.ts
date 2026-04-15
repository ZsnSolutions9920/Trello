import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { messageService } from "@/services/message.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, AppError } from "@/lib/errors";

// GET — list messages for this board (auth required, owner only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = getAuthUserId(req);
    const messages = await messageService.getMessagesForBoard(id, userId);
    return new NextResponse(JSON.stringify(messages), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Board messages error:", error);
    return errorResponse(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { senderName, senderEmail, content, website } = body;

    // Honeypot: if the hidden "website" field is filled, it's a bot
    if (website) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    // Validation
    if (!senderName?.trim() || senderName.length > 100) {
      throw new AppError(400, "Name is required (max 100 characters)");
    }
    if (!content?.trim() || content.length > 2000) {
      throw new AppError(400, "Message is required (max 2000 characters)");
    }
    if (senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      throw new AppError(400, "Invalid email format");
    }

    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed, retryAfterMs } = checkRateLimit(`msg:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((retryAfterMs || 0) / 1000)) },
        },
      );
    }

    await messageService.sendContactMessage(
      id,
      senderName.trim(),
      senderEmail?.trim(),
      content.trim(),
      ip,
    );

    return NextResponse.json({ success: true }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
