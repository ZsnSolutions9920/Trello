import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { exchangeCode, getDiscordUser } from "@/lib/discord";
import { userRepository } from "@/repositories/user.repository";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface StatePayload {
  userId: string;
  purpose: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/settings?error=missing_params`);
  }

  // Validate state to prevent CSRF
  let payload: StatePayload;
  try {
    payload = jwt.verify(state, JWT_SECRET) as StatePayload;
    if (payload.purpose !== "discord-oauth") throw new Error("Invalid state");
  } catch {
    return NextResponse.redirect(`${APP_URL}/settings?error=invalid_state`);
  }

  try {
    // Exchange code for Discord access token
    const { access_token } = await exchangeCode(code);

    // Get the Discord user's ID
    const discordUser = await getDiscordUser(access_token);

    // Store the Discord ID on the user record
    await userRepository.updateDiscordId(payload.userId, discordUser.id);

    return NextResponse.redirect(`${APP_URL}/?discord=connected`);
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.redirect(`${APP_URL}/settings?error=discord_failed`);
  }
}
