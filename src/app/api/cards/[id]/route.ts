import { NextRequest, NextResponse } from "next/server";
import { cardService } from "@/services/card.service";
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
    const card = await cardService.update(id, data);
    emitBoardEvent(card.list.boardId, SocketEvents.CARD_UPDATED, card);
    return NextResponse.json(card);
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
    const card = await cardService.delete(id);
    emitBoardEvent(card.list.boardId, SocketEvents.CARD_DELETED, { id, listId: card.listId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
