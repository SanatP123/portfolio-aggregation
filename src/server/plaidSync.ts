import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createPlaidClient } from "@/src/lib/plaid";
import { decryptSecret } from "@/src/server/crypto";

type PlaidConnection = {
  id: string;
  user_id: string;
  access_token: string | null;
  institution_name: string;
};

type BrokerageAccountRow = {
  id: string;
  provider_account_id: string;
};

type SyncOptions = {
  userId?: string;
  connectionId?: string;
  itemId?: string;
};

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function mapTransactionType(type: string, subtype?: string | null) {
  if (type === "buy") return "buy";
  if (type === "sell") return "sell";
  if (type === "fee") return "fee";
  if (type === "transfer") return "transfer";
  if (subtype?.includes("dividend")) return "dividend";
  if (subtype === "deposit" || subtype === "contribution") return "deposit";
  if (subtype === "withdrawal" || subtype === "distribution") return "withdrawal";
  return "other";
}

function getPlaidErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null) return null;
  const maybePlaidError = error as { response?: { data?: { error_code?: string } } };
  return maybePlaidError.response?.data?.error_code ?? null;
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const deduped = new Map<string, T>();

  for (const item of items) {
    deduped.set(getKey(item), item);
  }

  return Array.from(deduped.values());
}

export async function syncPlaidConnections(options: SyncOptions) {
  const supabase = createSupabaseServerClient();
  const plaid = createPlaidClient();
  let syncJobId: string | null = null;
  const syncUserId = options.userId ?? "system";

  try {
    const syncJobResult = await supabase
      .from("sync_jobs")
      .insert({
        user_id: syncUserId,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (syncJobResult.error) throw new Error(syncJobResult.error.message);
    syncJobId = syncJobResult.data.id;

    let connectionsQuery = supabase
      .from("brokerage_connections")
      .select("id,user_id,access_token,institution_name")
      .eq("provider", "plaid")
      .eq("status", "connected");

    if (options.userId) connectionsQuery = connectionsQuery.eq("user_id", options.userId);
    if (options.connectionId) connectionsQuery = connectionsQuery.eq("id", options.connectionId);
    if (options.itemId) connectionsQuery = connectionsQuery.eq("item_id", options.itemId);

    const { data: connections, error: connectionsError } = await connectionsQuery;
    if (connectionsError) throw new Error(connectionsError.message);

    const plaidConnections = (connections ?? []) as PlaidConnection[];
    if (plaidConnections.length === 0) {
      throw new Error("No connected Plaid accounts found.");
    }

    const now = new Date().toISOString();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);

    let syncedAccounts = 0;
    let syncedHoldings = 0;
    let syncedTransactions = 0;
    const warnings: string[] = [];

    for (const connection of plaidConnections) {
      if (!connection.access_token) {
        warnings.push(`Connection ${connection.id} is missing a Plaid access token.`);
        continue;
      }

      const accessToken = decryptSecret(connection.access_token);

      const holdingsResponse = await plaid.investmentsHoldingsGet({
        access_token: accessToken,
      });

      const accounts = holdingsResponse.data.accounts;
      const holdings = holdingsResponse.data.holdings;
      const securities = holdingsResponse.data.securities;
      const userId = connection.user_id;

      const securityById = new Map(securities.map((security) => [security.security_id, security]));
      const holdingsValueByAccount = new Map<string, number>();

      for (const holding of holdings) {
        holdingsValueByAccount.set(
          holding.account_id,
          (holdingsValueByAccount.get(holding.account_id) ?? 0) + Number(holding.institution_value ?? 0)
        );
      }

      const accountUpserts = uniqueBy(
        accounts.map((account) => ({
          user_id: userId,
          connection_id: connection.id,
          provider_account_id: account.account_id,
          institution_name: connection.institution_name,
          account_name: account.name,
          account_type: String(account.type ?? "investment"),
          account_subtype: account.subtype ? String(account.subtype) : null,
          currency: account.balances.iso_currency_code ?? "USD",
          cash_balance: Number(account.balances.available ?? 0),
          total_value: Number(account.balances.current ?? holdingsValueByAccount.get(account.account_id) ?? 0),
          last_synced_at: now,
        })),
        (account) => `${account.connection_id}:${account.provider_account_id}`
      );

      const accountsResult = await supabase
        .from("brokerage_accounts")
        .upsert(accountUpserts, { onConflict: "connection_id,provider_account_id" })
        .select("id,provider_account_id");

      if (accountsResult.error) throw new Error(accountsResult.error.message);
      syncedAccounts += accountUpserts.length;

      const accountIdByProviderId = new Map(
        ((accountsResult.data ?? []) as BrokerageAccountRow[]).map((account) => [account.provider_account_id, account.id])
      );

      const securityUpserts = uniqueBy(
        securities.map((security) => ({
          symbol: security.ticker_symbol ?? security.name ?? security.security_id,
          name: security.name ?? security.ticker_symbol ?? security.security_id,
          security_type: security.type ?? "other",
          exchange: security.market_identifier_code ?? "UNKNOWN",
          currency: security.iso_currency_code ?? "USD",
        })),
        (security) => `${security.symbol}:${security.exchange}:${security.currency}`
      );

      if (securityUpserts.length > 0) {
        const securitiesResult = await supabase
          .from("securities")
          .upsert(securityUpserts, { onConflict: "symbol,exchange,currency" });

        if (securitiesResult.error) throw new Error(securitiesResult.error.message);
      }

      const holdingUpserts = uniqueBy(
        holdings.flatMap((holding) => {
          const accountId = accountIdByProviderId.get(holding.account_id);
          const security = securityById.get(holding.security_id);
          if (!accountId) return [];

          const symbol = security?.ticker_symbol ?? security?.name ?? holding.security_id;
          const price = Number(holding.institution_price ?? security?.close_price ?? 0);

          return {
            user_id: userId,
            account_id: accountId,
            symbol,
            name: security?.name ?? symbol,
            quantity: Number(holding.quantity ?? 0),
            price,
            market_value: Number(holding.institution_value ?? Number(holding.quantity ?? 0) * price),
            cost_basis: holding.cost_basis === null ? null : Number(holding.cost_basis ?? 0),
            currency: holding.iso_currency_code ?? security?.iso_currency_code ?? "USD",
            as_of: holding.institution_price_datetime ?? holding.institution_price_as_of ?? now,
          };
        }),
        (holding) => `${holding.account_id}:${holding.symbol}`
      );

      if (holdingUpserts.length > 0) {
        const holdingsResult = await supabase
          .from("holdings")
          .upsert(holdingUpserts, { onConflict: "account_id,symbol" });

        if (holdingsResult.error) throw new Error(holdingsResult.error.message);
        syncedHoldings += holdingUpserts.length;
      }

      try {
        const allTransactions = [];
        const transactionSecurities = new Map();
        const pageSize = 500;
        let offset = 0;
        let totalTransactions = 0;

        do {
          const transactionResponse = await plaid.investmentsTransactionsGet({
            access_token: accessToken,
            start_date: toDateString(startDate),
            end_date: toDateString(endDate),
            options: {
              count: pageSize,
              offset,
            },
          });

          allTransactions.push(...transactionResponse.data.investment_transactions);
          for (const security of transactionResponse.data.securities) {
            transactionSecurities.set(security.security_id, security);
          }

          totalTransactions = transactionResponse.data.total_investment_transactions;
          offset += pageSize;
        } while (offset < totalTransactions);

        const transactionUpserts = uniqueBy(
          allTransactions.flatMap((transaction) => {
            const accountId = accountIdByProviderId.get(transaction.account_id);
            if (!accountId) return [];

            const security = transaction.security_id ? transactionSecurities.get(transaction.security_id) : null;
            const symbol = security?.ticker_symbol ?? security?.name ?? null;

            return {
              user_id: userId,
              account_id: accountId,
              provider_transaction_id: transaction.investment_transaction_id,
              transaction_type: mapTransactionType(String(transaction.type), String(transaction.subtype ?? "")),
              symbol,
              quantity: transaction.quantity === null ? null : Number(transaction.quantity),
              price: transaction.price === null ? null : Number(transaction.price),
              amount: Number(transaction.amount ?? 0),
              currency: transaction.iso_currency_code ?? "USD",
              transaction_date: transaction.date,
              raw_data: transaction,
            };
          }),
          (transaction) => `${transaction.account_id}:${transaction.provider_transaction_id}`
        );

        if (transactionUpserts.length > 0) {
          const transactionsResult = await supabase
            .from("investment_transactions")
            .upsert(transactionUpserts, { onConflict: "account_id,provider_transaction_id" });

          if (transactionsResult.error) throw new Error(transactionsResult.error.message);
          syncedTransactions += transactionUpserts.length;
        }
      } catch (error) {
        const plaidErrorCode = getPlaidErrorCode(error);
        if (plaidErrorCode === "PRODUCT_NOT_READY") {
          warnings.push(`Investment transactions are not ready yet for ${connection.institution_name}. Try syncing again later.`);
        } else {
          throw error;
        }
      }

      const accountTotalValue = accountUpserts.reduce((sum, account) => sum + Number(account.total_value ?? 0), 0);
      const accountCashValue = accountUpserts.reduce((sum, account) => sum + Number(account.cash_balance ?? 0), 0);

      const snapshotResult = await supabase
        .from("portfolio_snapshots")
        .upsert(
          {
            user_id: userId,
            snapshot_date: toDateString(new Date()),
            total_value: accountTotalValue,
            cash_value: accountCashValue,
            invested_value: accountTotalValue - accountCashValue,
            currency: "USD",
          },
          { onConflict: "user_id,snapshot_date,currency" }
        );

      if (snapshotResult.error) throw new Error(snapshotResult.error.message);

      const connectionUpdateResult = await supabase
        .from("brokerage_connections")
        .update({
          status: "connected",
          last_synced_at: now,
        })
        .eq("id", connection.id);

      if (connectionUpdateResult.error) throw new Error(connectionUpdateResult.error.message);
    }

    await supabase
      .from("sync_jobs")
      .update({
        status: "succeeded",
        finished_at: new Date().toISOString(),
      })
      .eq("id", syncJobId);

    return {
      status: "succeeded",
      syncedConnections: plaidConnections.length,
      syncedAccounts,
      syncedHoldings,
      syncedTransactions,
      warnings,
    };
  } catch (error) {
    if (syncJobId) {
      await supabase
        .from("sync_jobs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : "Unknown Plaid sync error",
        })
        .eq("id", syncJobId);
    }

    throw error;
  }
}
