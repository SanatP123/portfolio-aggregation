import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { jsonError, requireUserId } from "@/src/server/api";

type LegacyHolding = {
  symbol?: string;
  quantity?: number;
  price?: number;
};

export async function POST() {
  const { userId, response } = await requireUserId();
  if (response) return response;

  const supabase = createSupabaseServerClient();
  let syncJobId: string | null = null;

  try {
    const syncJobResult = await supabase
      .from("sync_jobs")
      .insert({
        user_id: userId,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (syncJobResult.error) throw new Error(syncJobResult.error.message);
    syncJobId = syncJobResult.data.id;

    const { data: legacyRow, error: legacyError } = await supabase
      .from("users_data")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();

    if (legacyError) throw new Error(legacyError.message);
    if (!legacyRow?.data) throw new Error("No users_data row found to sync.");

    const legacyHoldings = Array.isArray(legacyRow.data.holdings)
      ? (legacyRow.data.holdings as LegacyHolding[])
      : [];
    const totalValue = Number(legacyRow.data.totalValue ?? 0);
    const now = new Date().toISOString();

    const connectionResult = await supabase
      .from("brokerage_connections")
      .upsert(
        {
          user_id: userId,
          provider: "manual",
          provider_connection_id: `manual-${userId}`,
          institution_name: "Manual portfolio",
          status: "connected",
          last_synced_at: now,
        },
        { onConflict: "provider,provider_connection_id" }
      )
      .select("id")
      .single();

    if (connectionResult.error) throw new Error(connectionResult.error.message);

    const accountResult = await supabase
      .from("brokerage_accounts")
      .upsert(
        {
          user_id: userId,
          connection_id: connectionResult.data.id,
          provider_account_id: `manual-account-${userId}`,
          institution_name: "Manual portfolio",
          account_name: "Manual holdings",
          account_type: "investment",
          currency: "USD",
          cash_balance: 0,
          total_value: totalValue,
          last_synced_at: now,
        },
        { onConflict: "connection_id,provider_account_id" }
      )
      .select("id")
      .single();

    if (accountResult.error) throw new Error(accountResult.error.message);

    const normalizedHoldings = legacyHoldings
      .filter((holding) => holding.symbol)
      .map((holding) => {
        const quantity = Number(holding.quantity ?? 0);
        const price = Number(holding.price ?? 0);

        return {
          user_id: userId,
          account_id: accountResult.data.id,
          symbol: String(holding.symbol),
          name: String(holding.symbol),
          quantity,
          price,
          market_value: quantity * price,
          currency: "USD",
          as_of: now,
        };
      });

    if (normalizedHoldings.length > 0) {
      const securityResult = await supabase
        .from("securities")
        .upsert(
          normalizedHoldings.map((holding) => ({
            symbol: holding.symbol,
            name: holding.symbol,
            security_type: "equity",
            currency: "USD",
          })),
          { onConflict: "symbol,exchange,currency", ignoreDuplicates: true }
        );

      if (securityResult.error) throw new Error(securityResult.error.message);

      const holdingsResult = await supabase
        .from("holdings")
        .upsert(normalizedHoldings, { onConflict: "account_id,symbol" });

      if (holdingsResult.error) throw new Error(holdingsResult.error.message);
    }

    const snapshotResult = await supabase
      .from("portfolio_snapshots")
      .upsert(
        {
          user_id: userId,
          snapshot_date: new Date().toISOString().slice(0, 10),
          total_value: totalValue,
          cash_value: 0,
          invested_value: totalValue,
          currency: "USD",
        },
        { onConflict: "user_id,snapshot_date,currency" }
      );

    if (snapshotResult.error) throw new Error(snapshotResult.error.message);

    await supabase
      .from("sync_jobs")
      .update({
        status: "succeeded",
        finished_at: new Date().toISOString(),
      })
      .eq("id", syncJobId);

    return NextResponse.json({
      status: "succeeded",
      syncedHoldings: normalizedHoldings.length,
      totalValue,
    });
  } catch (error) {
    if (syncJobId) {
      await supabase
        .from("sync_jobs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : "Unknown sync error",
        })
        .eq("id", syncJobId);
    }

    return jsonError(error);
  }
}
