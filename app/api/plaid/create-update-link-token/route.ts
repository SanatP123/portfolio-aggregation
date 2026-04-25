import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createPlaidClient, plaidCountryCodes } from "@/src/lib/plaid";
import { jsonError, requireUserId } from "@/src/server/api";

type UpdateLinkTokenRequest = {
  connectionId?: string;
};

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const body = (await request.json()) as UpdateLinkTokenRequest;
    if (!body.connectionId) {
      return NextResponse.json({ error: "Missing connectionId" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data: connection, error } = await supabase
      .from("brokerage_connections")
      .select("access_token,institution_name")
      .eq("id", body.connectionId)
      .eq("user_id", userId)
      .eq("provider", "plaid")
      .single();

    if (error) throw new Error(error.message);
    if (!connection.access_token) throw new Error("Connection is missing Plaid access token.");

    const plaid = createPlaidClient();
    const linkTokenResponse = await plaid.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "Portfolio Aggregation",
      country_codes: plaidCountryCodes,
      language: "en",
      access_token: connection.access_token,
    });

    return NextResponse.json({
      linkToken: linkTokenResponse.data.link_token,
      expiration: linkTokenResponse.data.expiration,
      requestId: linkTokenResponse.data.request_id,
    });
  } catch (error) {
    return jsonError(error);
  }
}
