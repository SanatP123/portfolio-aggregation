export type ApiPortfolioSummary = {
  totalValue: number;
  cashValue: number;
  investedValue: number;
  accountCount: number;
  lastSyncedAt: string | null;
  source: "normalized" | "legacy" | "empty";
};

export type ApiHolding = {
  symbol: string;
  name: string | null;
  quantity: number | string;
  price: number | string;
  market_value: number | string;
  currency: string | null;
  as_of?: string | null;
  brokerage_accounts?:
    | {
        account_name?: string | null;
        institution_name?: string | null;
      }
    | Array<{
        account_name?: string | null;
        institution_name?: string | null;
      }>;
};

export type ApiTransaction = {
  id: string;
  transaction_type: string;
  symbol: string | null;
  quantity: number | string | null;
  price: number | string | null;
  amount: number | string;
  currency: string | null;
  transaction_date: string;
};

export type ApiConnection = {
  id: string;
  provider: string;
  institution_name: string;
  status: string;
  last_synced_at: string | null;
  created_at: string;
};

export type PortfolioSummaryResponse = {
  summary: ApiPortfolioSummary;
  holdings: ApiHolding[];
  transactions: ApiTransaction[];
  connections: ApiConnection[];
  legacy: unknown;
};

export async function fetchPortfolioSummary() {
  const response = await fetch("/api/portfolio/summary", {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to fetch portfolio summary.");
  }

  return payload as PortfolioSummaryResponse;
}
