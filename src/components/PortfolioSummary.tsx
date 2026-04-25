"use client";

import { useEffect, useState } from "react";
import { fetchPortfolioSummary, type ApiHolding } from "@/src/db/portfolioApi";
import { useUser } from "@/src/hooks/useUser";

type HoldingView = {
  symbol: string;
  quantity: number;
  price: number;
  marketValue: number;
  accountName: string;
  institutionName: string;
};

type PortfolioData = {
  totalValue: number;
  holdings: HoldingView[];
  source: "normalized" | "legacy" | "empty";
};

function getAccount(holding: ApiHolding) {
  return Array.isArray(holding.brokerage_accounts)
    ? holding.brokerage_accounts[0]
    : holding.brokerage_accounts;
}

export default function PortfolioSummary() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function fetchPortfolio() {
      if (!isSignedIn || !userId) return;

      try {
        setError(null);        const data = await fetchPortfolioSummary();

        setPortfolioData({
          totalValue: data.summary.totalValue,
          source: data.summary.source,
          holdings: data.holdings.map((holding) => {
            const account = getAccount(holding);
            return {
              symbol: holding.symbol,
              quantity: Number(holding.quantity ?? 0),
              price: Number(holding.price ?? 0),
              marketValue: Number(holding.market_value ?? 0),
              accountName: account?.account_name ?? "Portfolio account",
              institutionName: account?.institution_name ?? "Connected institution",
            };
          }),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      }
    }

    fetchPortfolio();
  }, [isSignedIn, userId]);

  if (!isLoaded) {
    return <div className="dashboard-card animate-pulse">Loading portfolio...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="dashboard-card">
        <p className="eyebrow">Portfolio summary</p>
        <h2 className="card-title">Your holdings, waiting.</h2>
        <p className="mt-3 text-stone-600">Please sign in to view your portfolio.</p>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-card border-red-200 bg-red-50/80 text-red-900">Error: {error}</div>;
  }

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Portfolio summary</p>
          <h2 className="card-title">Current position</h2>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
          {portfolioData?.source === "normalized" ? "Synced" : "Legacy"}
        </span>
      </div>
      {portfolioData ? (
        <div className="mt-8">
          <div className="rounded-[1.75rem] bg-stone-950 p-6 text-[#f8f2e8] shadow-2xl shadow-stone-900/20">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-400">
              Total value
            </p>
            <p className="mt-3 font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
              ${Number(portfolioData.totalValue).toLocaleString()}
            </p>
          </div>
          {portfolioData.holdings.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {portfolioData.holdings.map((holding, index) => (
                <div key={`${holding.accountName}-${holding.symbol}-${index}`} className="rounded-3xl border border-stone-200/80 bg-white/55 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white/80 hover:shadow-xl hover:shadow-stone-900/10">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black tracking-tight text-stone-950">{holding.symbol}</div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      {holding.quantity.toLocaleString()} shares
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    {holding.institutionName} · {holding.accountName}
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Price</p>
                      <p className="mt-1 text-stone-700">${holding.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Value</p>
                      <p className="mt-1 text-lg font-bold text-emerald-800">
                        ${holding.marketValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-stone-600">No holdings available.</p>
          )}
        </div>
      ) : (
        <p className="mt-6 text-stone-600">No portfolio data available.</p>
      )}
    </div>
  );
}
