import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }
  console.error("Unexpected error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}
