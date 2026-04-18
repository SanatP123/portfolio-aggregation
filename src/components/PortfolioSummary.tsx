"use client";

import { useEffect, useState } from "react";
import { getUserHoldings } from "@/src/db/queries";

type Holding = {
  asset: string;
  amount: number;
};

export default function PortfolioSummary() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHoldings() {
      try {
        const userId = "example-user-id"; // Replace with actual user ID from Clerk
        const data = await getUserHoldings(userId);
        setHoldings(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }

    fetchHoldings();
  }, []);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-800">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold">Portfolio Summary</h2>
      {holdings.length > 0 ? (
        <ul>
          {holdings.map((holding, index) => (
            <li key={index} className="text-gray-600">
              {holding.asset}: ${holding.amount}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No holdings available.</p>
      )}
    </div>
  );
}