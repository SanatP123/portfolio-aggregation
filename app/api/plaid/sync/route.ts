import { NextResponse } from "next/server";
import { jsonError, requireUserId } from "@/src/server/api";
import { syncPlaidConnections } from "@/src/server/plaidSync";

type SyncRequestBody = {
  connectionId?: string;
};

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const body = (await request.json().catch(() => ({}))) as SyncRequestBody;
    const result = await syncPlaidConnections({
      userId,
      connectionId: body.connectionId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "No connected Plaid accounts found.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return jsonError(error);
  }
}
