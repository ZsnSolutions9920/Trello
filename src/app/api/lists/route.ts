import { NextRequest, NextResponse } from "next/server";
import { listService } from "@/services/list.service";
import { errorResponse } from "@/lib/errors";
import { emitBoardEvent } from "@/lib/socket-server";
import { SocketEvents } from "@/types/socket-events";

export async function POST(req: NextRequest) {
  try {
    const { title, boardId } = await req.json();
    const list = await listService.create(title, boardId);
    emitBoardEvent(boardId, SocketEvents.LIST_CREATED, list);
    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
