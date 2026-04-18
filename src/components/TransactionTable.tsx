"use client";
import { useEffect, useState } from "react";
import { addTransaction } from "@/src/db/queries";

type Transaction = {
  user_id: string;
  asset: string;
  amount: number;
  date: string;
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const userId = "example-user-id"; // Replace with actual user ID from Clerk
        const newTransaction: Transaction = {
          user_id: userId,
          asset: "Example Asset",
          amount: 100,
          date: new Date().toISOString(),
        };
        const data = await addTransaction(newTransaction);
        if (data) {
          setTransactions((prev) => [...prev, ...data]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }

    fetchTransactions();
  }, []);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-800">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold">Recent Transactions</h2>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index} className="text-gray-600">
              {transaction.asset}: ${transaction.amount} on {new Date(transaction.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No transactions available.</p>
      )}
    </div>
  );
}