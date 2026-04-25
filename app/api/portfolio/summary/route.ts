import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { jsonError, requireUserId } from "@/src/server/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const supabase = createSupabaseServerClient();

    const [accountsResult, connectionsResult] = await Promise.all([
      supabase
        .from("brokerage_accounts")
        .select("id,total_value,cash_balance,last_synced_at,brokerage_connections!inner(provider,status)")
        .eq("user_id", userId)
        .eq("brokerage_connections.status", "connected")
        .neq("brokerage_connections.provider", "manual"),
      supabase
        .from("brokerage_connections")
        .select("id,provider,institution_name,status,last_synced_at,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    const firstError = [accountsResult.error, connectionsResult.error].find(Boolean);

    if (firstError) {
      throw new Error(firstError.message);
    }

    const accounts = accountsResult.data ?? [];
    const connectedAccountIds = accounts.map((account) => account.id);

    const [holdingsResult, transactionsResult] = connectedAccountIds.length
      ? await Promise.all([
          supabase
            .from("holdings")
            .select("symbol,name,quantity,price,market_value,currency,as_of,brokerage_accounts(account_name,institution_name)")
            .eq("user_id", userId)
            .in("account_id", connectedAccountIds)
            .order("market_value", { ascending: false }),
          supabase
            .from("investment_transactions")
            .select("id,transaction_type,symbol,quantity,price,amount,currency,transaction_date")
            .eq("user_id", userId)
            .in("account_id", connectedAccountIds)
            .order("transaction_date", { ascending: false })
            .limit(20),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ];

    const portfolioError = [holdingsResult.error, transactionsResult.error].find(Boolean);

    if (portfolioError) {
      throw new Error(portfolioError.message);
    }

    const totalValue = accounts.reduce((sum, account) => sum + Number(account.total_value ?? 0), 0);
    const cashValue = accounts.reduce((sum, account) => sum + Number(account.cash_balance ?? 0), 0);
    const lastSyncedAt = accounts.reduce<string | null>((latest, account) => {
      const syncedAt = account.last_synced_at;
      if (!syncedAt) return latest;
      if (!latest) return syncedAt;
      return new Date(syncedAt) > new Date(latest) ? syncedAt : latest;
    }, null);

    const summary = {
      totalValue,
      cashValue,
      investedValue: totalValue - cashValue,
      accountCount: accounts.length,
      lastSyncedAt,
      source: accounts.length ? "normalized" : "empty",
    };

    return NextResponse.json({
      summary,
      holdings: holdingsResult.data ?? [],
      transactions: transactionsResult.data ?? [],
      connections: connectionsResult.data ?? [],
      legacy: null,
    });
  } catch (error) {
    return jsonError(error);
  }
}
