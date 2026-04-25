import { NextResponse } from "next/server";
import { jsonError } from "@/src/server/api";
import { syncPlaidConnections } from "@/src/server/plaidSync";

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const result = await syncPlaidConnections({});
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
