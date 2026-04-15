import { NextRequest, NextResponse } from "next/server";
import { boardService } from "@/services/board.service";
import { getAuthUserId } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const boards = await boardService.getAllForUser(userId);
    return NextResponse.json(boards);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const { title } = await req.json();
    const board = await boardService.create(title, userId);
    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
