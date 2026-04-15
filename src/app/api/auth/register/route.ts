import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { errorResponse } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    const result = await authService.register(email, password, name);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
