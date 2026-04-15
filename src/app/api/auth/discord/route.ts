import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { authService } from "@/services/auth.service";
import { getOAuthUrl } from "@/lib/discord";
import { errorResponse, AppError } from "@/lib/errors";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export async function GET(req: NextRequest) {
  try {
    // This route is hit via browser navigation (<a href>), not fetch,
    // so the JWT comes as a ?token= query param instead of Authorization header.
    const token = req.nextUrl.searchParams.get("token");
    if (!token) throw new AppError(401, "Authentication required");

    const { userId } = authService.verifyToken(token);

    // Create a short-lived state token to prevent CSRF
    const state = jwt.sign({ userId, purpose: "discord-oauth" }, JWT_SECRET, {
      expiresIn: "10m",
    });

    const url = getOAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    return errorResponse(error);
  }
}
