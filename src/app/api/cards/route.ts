import { NextRequest, NextResponse } from "next/server";
import { cardService } from "@/services/card.service";
import { errorResponse } from "@/lib/errors";
import { emitBoardEvent } from "@/lib/socket-server";
import { SocketEvents } from "@/types/socket-events";

export async function POST(req: NextRequest) {
  try {
    const { title, listId } = await req.json();
    const card = await cardService.create(title, listId);
    emitBoardEvent(card.list.boardId, SocketEvents.CARD_CREATED, card);
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
