import { supabase } from "@/lib/supabaseClient";

export type NormalizedHolding = {
  symbol: string;
  name: string | null;
  quantity: number;
  price: number;
  marketValue: number;
  currency: string;
  accountName: string;
  institutionName: string;
};

export type PortfolioSummary = {
  totalValue: number;
  cashValue: number;
  investedValue: number;
  accountCount: number;
  lastSyncedAt: string | null;
};

export type InvestmentTransaction = {
  id: string;
  transactionType: string;
  symbol: string | null;
  quantity: number | null;
  price: number | null;
  amount: number;
  currency: string;
  transactionDate: string;
};

export async function getNormalizedPortfolioSummary(userId: string): Promise<PortfolioSummary | null> {
  const { data, error } = await supabase
    .from("portfolio_summary")
    .select("total_value,cash_value,invested_value,account_count,last_synced_at")
    .eq("user_id", userId.trim())
    .maybeSingle();

  if (error) {
    console.error("Error fetching normalized portfolio summary:", error);
    return null;
  }

  if (!data) return null;

  return {
    totalValue: Number(data.total_value ?? 0),
    cashValue: Number(data.cash_value ?? 0),
    investedValue: Number(data.invested_value ?? 0),
    accountCount: Number(data.account_count ?? 0),
    lastSyncedAt: data.last_synced_at ?? null,
  };
}

export async function getNormalizedHoldings(userId: string): Promise<NormalizedHolding[]> {
  const { data, error } = await supabase
    .from("holdings")
    .select("symbol,name,quantity,price,market_value,currency,brokerage_accounts(account_name,institution_name)")
    .eq("user_id", userId.trim())
    .order("market_value", { ascending: false });

  if (error) {
    console.error("Error fetching normalized holdings:", error);
    return [];
  }

  return (data ?? []).map((holding) => {
    const account = Array.isArray(holding.brokerage_accounts)
      ? holding.brokerage_accounts[0]
      : holding.brokerage_accounts;

    return {
      symbol: holding.symbol,
      name: holding.name,
      quantity: Number(holding.quantity ?? 0),
      price: Number(holding.price ?? 0),
      marketValue: Number(holding.market_value ?? 0),
      currency: holding.currency ?? "USD",
      accountName: account?.account_name ?? "Unknown account",
      institutionName: account?.institution_name ?? "Unknown institution",
    };
  });
}

export async function getNormalizedTransactions(userId: string): Promise<InvestmentTransaction[]> {
  const { data, error } = await supabase
    .from("investment_transactions")
    .select("id,transaction_type,symbol,quantity,price,amount,currency,transaction_date")
    .eq("user_id", userId.trim())
    .order("transaction_date", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching normalized transactions:", error);
    return [];
  }

  return (data ?? []).map((transaction) => ({
    id: transaction.id,
    transactionType: transaction.transaction_type,
    symbol: transaction.symbol,
    quantity: transaction.quantity === null ? null : Number(transaction.quantity),
    price: transaction.price === null ? null : Number(transaction.price),
    amount: Number(transaction.amount ?? 0),
    currency: transaction.currency ?? "USD",
    transactionDate: transaction.transaction_date,
  }));
}
