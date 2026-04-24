"use client";

import { useEffect, useState } from "react";
import { getUserData } from "@/src/db/queries";
import { useUser } from "@/src/hooks/useUser";

type PerformanceEntry = {
  date: string;
  value: number;
};

export default function PerformanceChart() {
  const [performance, setPerformance] = useState<PerformanceEntry[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function fetchPerformance() {
      if (!userId) return;

      try {
        const data = await getUserData(userId);

        if (data && data.data) {
          const portfolioValue = Number(data.data.totalValue ?? 0);
          setTotalValue(portfolioValue);

          if (data.data.performance && data.data.performance.length > 0) {
            setPerformance(data.data.performance);
          } else if (portfolioValue) {
            setPerformance([
              {
                date: new Date().toISOString(),
                value: portfolioValue,
              },
            ]);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }

    fetchPerformance();
  }, [userId]);

  if (!isLoaded) {
    return <div className="dashboard-card animate-pulse">Loading performance data...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="dashboard-card">
        <p className="eyebrow">Performance</p>
        <h2 className="card-title">Growth view</h2>
        <p className="mt-3 text-stone-600">Please sign in to view your performance data.</p>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-card border-red-200 bg-red-50/80 text-red-900">Error: {error}</div>;
  }

  return (
    <div className="dashboard-card h-full">
      <p className="eyebrow">Performance</p>
      <h2 className="card-title">Value trajectory</h2>
      {performance.length > 0 ? (
        <div className="mt-8 space-y-3">
          {performance.map((entry, index) => (
            <div key={index} className="rounded-3xl border border-stone-200/80 bg-white/55 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-5">
                <span className="text-sm font-semibold text-stone-500">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span className="font-serif text-3xl font-semibold tracking-tight text-emerald-800">
                  ${entry.value.toLocaleString()}
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-200">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-700 to-amber-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-stone-600">No performance history available yet.</p>
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-5">
            <h3 className="font-semibold text-emerald-950">Portfolio value</h3>
            <p className="mt-2 leading-7 text-emerald-800">
              Your portfolio is currently valued at ${totalValue.toLocaleString()}.
              Performance tracking will be available once you have historical data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
