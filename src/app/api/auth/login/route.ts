import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { errorResponse } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const result = await authService.login(email, password);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
