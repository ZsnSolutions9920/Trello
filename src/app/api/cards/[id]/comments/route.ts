import { NextRequest, NextResponse } from "next/server";
import { commentService } from "@/services/comment.service";
import { getAuthUserId } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const comments = await commentService.getByCard(id);
    return NextResponse.json(comments);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = getAuthUserId(req);
    const { content } = await req.json();
    const comment = await commentService.create(content, id, userId);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
