import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId, response: null };
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "An unknown error occurred.";
  return NextResponse.json({ error: message }, { status });
}
