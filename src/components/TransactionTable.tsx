"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/src/hooks/useUser";

type Transaction = {
  asset: string;
  amount: number;
  date: string;
  type: "BUY" | "SELL";
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function fetchTransactions() {
      if (!userId) return;

      try {
        const mockTransactions: Transaction[] = [
          {
            asset: "AAPL",
            amount: 1800,
            date: new Date(Date.now() - 86400000).toISOString(),
            type: "BUY",
          },
          {
            asset: "TSLA",
            amount: 1250,
            date: new Date(Date.now() - 172800000).toISOString(),
            type: "BUY",
          },
        ];

        setTransactions(mockTransactions);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }

    fetchTransactions();
  }, [userId]);

  if (!isLoaded) {
    return <div className="dashboard-card animate-pulse">Loading transactions...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="dashboard-card">
        <p className="eyebrow">Recent transactions</p>
        <h2 className="card-title">Activity ledger</h2>
        <p className="mt-3 text-stone-600">Please sign in to view your transactions.</p>
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-card border-red-200 bg-red-50/80 text-red-900">Error: {error}</div>;
  }

  return (
    <div className="dashboard-card">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Recent transactions</p>
          <h2 className="card-title">Activity ledger</h2>
        </div>
        <p className="text-sm text-stone-500">Showing latest portfolio activity</p>
      </div>
      {transactions.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-stone-200/80 bg-white/45">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-950 text-[#f8f2e8]">
                <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.2em]">Type</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.2em]">Asset</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.2em]">Amount</th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.2em]">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="border-b border-stone-200/80 transition last:border-0 hover:bg-white/75">
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-black tracking-[0.14em] ${
                      transaction.type === "BUY" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="p-4 font-black text-stone-950">{transaction.asset}</td>
                  <td className="p-4 font-semibold text-stone-700">${transaction.amount.toLocaleString()}</td>
                  <td className="p-4 text-stone-500">{new Date(transaction.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-stone-600">No transactions available.</p>
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5">
            <h3 className="font-semibold text-amber-950">Note</h3>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Transaction tracking requires a separate transactions table in your database.
              Currently, this is displaying mock data. To implement real transaction tracking,
              you would need to create a transactions table in Supabase.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
