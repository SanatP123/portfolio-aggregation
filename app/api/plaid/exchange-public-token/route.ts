import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createPlaidClient } from "@/src/lib/plaid";
import { encryptSecret } from "@/src/server/crypto";
import { jsonError, requireUserId } from "@/src/server/api";

type ExchangeRequestBody = {
  publicToken?: string;
  institution?: {
    name?: string;
    institution_id?: string;
  } | null;
};

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const body = (await request.json()) as ExchangeRequestBody;
    if (!body.publicToken) {
      return NextResponse.json({ error: "Missing publicToken" }, { status: 400 });
    }

    const plaid = createPlaidClient();
    const exchangeResponse = await plaid.itemPublicTokenExchange({
      public_token: body.publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;
    const institutionName = body.institution?.name ?? "Plaid institution";

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("brokerage_connections")
      .upsert(
        {
          user_id: userId,
          provider: "plaid",
          provider_connection_id: itemId,
          item_id: itemId,
          access_token: encryptSecret(accessToken),
          institution_name: institutionName,
          status: "connected",
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "provider,provider_connection_id" }
      )
      .select("id,provider,institution_name,status,last_synced_at,created_at,item_id")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ connection: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
