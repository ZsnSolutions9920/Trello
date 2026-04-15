import { NextRequest, NextResponse } from "next/server";
import { listService } from "@/services/list.service";
import { errorResponse } from "@/lib/errors";
import { emitBoardEvent } from "@/lib/socket-server";
import { SocketEvents } from "@/types/socket-events";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const list = await listService.update(id, data);
    emitBoardEvent(list.boardId, SocketEvents.LIST_UPDATED, list);
    return NextResponse.json(list);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await listService.delete(id);
    emitBoardEvent(deleted.boardId, SocketEvents.LIST_DELETED, { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
