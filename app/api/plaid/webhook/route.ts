import { NextResponse } from "next/server";
import { jsonError } from "@/src/server/api";
import { syncPlaidConnections } from "@/src/server/plaidSync";

type PlaidWebhookBody = {
  webhook_type?: string;
  webhook_code?: string;
  item_id?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlaidWebhookBody;

    if (!body.item_id) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Missing item_id" });
    }

    const shouldSync =
      body.webhook_type === "HOLDINGS" ||
      body.webhook_type === "INVESTMENTS_TRANSACTIONS" ||
      body.webhook_code === "DEFAULT_UPDATE" ||
      body.webhook_code === "HISTORICAL_UPDATE";

    if (!shouldSync) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const result = await syncPlaidConnections({ itemId: body.item_id });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return jsonError(error);
  }
}
