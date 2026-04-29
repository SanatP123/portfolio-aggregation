"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPortfolioSummary, type PortfolioSummaryResponse } from "@/src/db/portfolioApi";
import { useUser } from "@/src/hooks/useUser";

const palette = ["#047857", "#f59e0b", "#0f172a", "#38bdf8", "#be123c", "#7c3aed"];

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<PortfolioSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    fetchPortfolioSummary()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load analytics."));
  }, [isSignedIn, userId]);

  const holdings = useMemo(() => {
    return (data?.holdings ?? [])
      .map((holding) => ({
        symbol: holding.symbol,
        value: toNumber(holding.market_value),
        quantity: toNumber(holding.quantity),
        price: toNumber(holding.price),
      }))
      .filter((holding) => holding.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const totalValue = data?.summary.totalValue ?? holdings.reduce((sum, holding) => sum + holding.value, 0);
  const largestHolding = holdings[0];
  const topThreeValue = holdings.slice(0, 3).reduce((sum, holding) => sum + holding.value, 0);
  const concentration = totalValue ? (topThreeValue / totalValue) * 100 : 0;

  const donutGradient = holdings.length
    ? `conic-gradient(${holdings
        .map((holding, index) => {
          const previous = holdings.slice(0, index).reduce((sum, item) => sum + item.value, 0);
          const start = totalValue ? (previous / totalValue) * 100 : 0;
          const end = totalValue ? ((previous + holding.value) / totalValue) * 100 : 0;
          return `${palette[index % palette.length]} ${start}% ${end}%`;
        })
        .join(", ")})`
    : "conic-gradient(#d6d3d1 0% 100%)";

  if (!isLoaded) {
    return <div className="dashboard-card animate-pulse">Loading analytics...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="dashboard-card">
        <p className="eyebrow">Analytics</p>
        <h2 className="card-title">Sign in to view portfolio analytics.</h2>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-card border-red-200 bg-red-50/80 text-red-900">Error: {error}</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="dashboard-card lg:col-span-5">
        <p className="eyebrow">Allocation</p>
        <h2 className="card-title">Portfolio wheel</h2>
        <div className="mt-8 grid place-items-center">
          <div className="relative grid h-64 w-64 place-items-center rounded-full shadow-2xl shadow-stone-900/10" style={{ background: donutGradient }}>
            <div className="grid h-36 w-36 place-items-center rounded-full bg-[#f8f2e8] text-center shadow-inner">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Total</p>
                <p className="mt-1 font-serif text-3xl font-bold text-stone-950">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3">
          {holdings.slice(0, 6).map((holding, index) => (
            <div key={`${holding.symbol}-${index}`} className="flex items-center justify-between rounded-2xl bg-white/55 p-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: palette[index % palette.length] }} />
                <span className="font-bold text-stone-900">{holding.symbol}</span>
              </div>
              <span className="text-sm font-semibold text-stone-500">
                {totalValue ? ((holding.value / totalValue) * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-card lg:col-span-7">
        <p className="eyebrow">Exposure</p>
        <h2 className="card-title">Holding weight</h2>
        <div className="mt-8 space-y-4">
          {holdings.slice(0, 8).map((holding, index) => {
            const percent = totalValue ? (holding.value / totalValue) * 100 : 0;
            return (
              <div key={`${holding.symbol}-${index}`}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-black text-stone-950">{holding.symbol}</span>
                  <span className="font-semibold text-stone-500">${holding.value.toLocaleString()} · {percent.toFixed(1)}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-stone-200/80">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(percent, 100)}%`, background: palette[index % palette.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:col-span-12 lg:grid-cols-3">
        <div className="dashboard-card">
          <p className="eyebrow">Largest position</p>
          <h3 className="mt-3 font-serif text-4xl font-bold text-stone-950">{largestHolding?.symbol ?? "N/A"}</h3>
          <p className="mt-3 text-stone-600">${(largestHolding?.value ?? 0).toLocaleString()} market value</p>
        </div>
        <div className="dashboard-card">
          <p className="eyebrow">Top 3 concentration</p>
          <h3 className="mt-3 font-serif text-4xl font-bold text-stone-950">{concentration.toFixed(1)}%</h3>
          <p className="mt-3 text-stone-600">Combined weight of your three largest holdings.</p>
        </div>
        <div className="dashboard-card">
          <p className="eyebrow">Connected accounts</p>
          <h3 className="mt-3 font-serif text-4xl font-bold text-stone-950">{data?.summary.accountCount ?? 0}</h3>
          <p className="mt-3 text-stone-600">Accounts included in the current portfolio summary.</p>
        </div>
      </section>
    </div>
  );
}
