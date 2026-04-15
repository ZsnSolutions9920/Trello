import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { attendanceRepository } from "@/repositories/attendance.repository";
import { errorResponse } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const records = await attendanceRepository.findAllByUser(userId);
    return NextResponse.json(records);
  } catch (error) {
    return errorResponse(error);
  }
}
