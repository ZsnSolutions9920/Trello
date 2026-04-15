import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { AppError } from "@/lib/errors";

export function getAuthUserId(req: NextRequest): string {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const token = header.slice(7);
  const payload = authService.verifyToken(token);
  return payload.userId;
}
