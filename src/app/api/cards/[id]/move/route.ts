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
    const { targetListId, newPosition } = await req.json();
    const card = await cardService.move(id, targetListId, newPosition);
    emitBoardEvent(card.list.boardId, SocketEvents.CARD_MOVED, card);
    return NextResponse.json(card);
  } catch (error) {
    return errorResponse(error);
  }
}
