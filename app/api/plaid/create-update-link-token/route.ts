import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createPlaidClient, plaidCountryCodes, plaidProducts } from "@/src/lib/plaid";
import { requireUserId } from "@/src/server/api";
import { decryptSecret } from "@/src/server/crypto";

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

    if (error || !connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (!connection.access_token) {
      return NextResponse.json(
        { error: "This connection is missing a Plaid access token. Please disconnect and connect again." },
        { status: 400 }
      );
    }

    let decryptedAccessToken = "";
    try {
      decryptedAccessToken = decryptSecret(connection.access_token);
    } catch {
      return NextResponse.json(
        { error: "Unable to decrypt Plaid credentials. Set PLAID_TOKEN_ENCRYPTION_KEY to the original value used for this connection, or reconnect the account." },
        { status: 400 }
      );
    }

    if (!decryptedAccessToken) {
      throw new Error("Failed to decrypt Plaid access token");
    }

    const plaid = createPlaidClient();

    let linkTokenResponse;

    try {
      linkTokenResponse = await plaid.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: "Portfolio Aggregation",
        country_codes: plaidCountryCodes,
        language: "en",
        access_token: decryptedAccessToken,
      });
    } catch {
      console.warn("Update mode failed, fallback to new link");

      linkTokenResponse = await plaid.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: "Portfolio Aggregation",
        country_codes: plaidCountryCodes,
        language: "en",
        products: plaidProducts,
      });
    }

    return NextResponse.json({
      linkToken: linkTokenResponse.data.link_token,
      expiration: linkTokenResponse.data.expiration,
      requestId: linkTokenResponse.data.request_id,
    });

  } catch (error: unknown) {
    const plaidError = error as {
      message?: string;
      response?: { data?: { error_message?: string } };
    };

    console.error("create-update-link-token failed:", {
      message: plaidError.message,
      plaid: plaidError.response?.data,
    });

    return NextResponse.json(
      { error: plaidError.response?.data?.error_message || plaidError.message || "Unable to create update link token." },
      { status: 500 }
    );
  }
}
