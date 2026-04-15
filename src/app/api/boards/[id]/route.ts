import { NextRequest, NextResponse } from "next/server";
import { boardService } from "@/services/board.service";
import { getAuthUserId } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getAuthUserId(req);
    const { id } = await params;
    const board = await boardService.getById(id, userId);
    return NextResponse.json(board);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getAuthUserId(req);
    const { id } = await params;
    const { title } = await req.json();
    const board = await boardService.update(id, title, userId);
    return NextResponse.json(board);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getAuthUserId(req);
    const { id } = await params;
    await boardService.delete(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
