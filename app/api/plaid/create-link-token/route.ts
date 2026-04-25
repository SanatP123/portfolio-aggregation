import { NextResponse } from "next/server";
import { createPlaidClient, plaidCountryCodes, plaidProducts } from "@/src/lib/plaid";
import { jsonError, requireUserId } from "@/src/server/api";

export async function POST() {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const plaid = createPlaidClient();
    const webhookUrl = process.env.PLAID_WEBHOOK_URL;

    const linkTokenResponse = await plaid.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "Portfolio Aggregation",
      products: plaidProducts,
      country_codes: plaidCountryCodes,
      language: "en",
      webhook: webhookUrl || undefined,
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
