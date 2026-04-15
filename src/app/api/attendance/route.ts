import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { attendanceService } from "@/services/attendance.service";
import { errorResponse } from "@/lib/errors";

// GET — check today's attendance status
export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const result = await attendanceService.getStatus(userId);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

// POST — sign in or sign out
export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const { action, photo } = await req.json();

    if (!photo) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    }

    if (action === "sign-in") {
      const record = await attendanceService.signIn(userId, photo);
      return NextResponse.json(record, { status: 201 });
    } else if (action === "sign-out") {
      const record = await attendanceService.signOut(userId, photo);
      return NextResponse.json(record);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return errorResponse(error);
  }
}
