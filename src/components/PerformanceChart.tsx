"use client";

import { useState } from "react";
import { useEffect } from "react";
import { getPerformanceData } from "@/src/db/queries";

type PerformanceEntry = {
  date: string;
  value: number;
};

export default function PerformanceChart() {
  const [performance, setPerformance] = useState<PerformanceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const userId = "example-user-id"; // Replace with actual user ID from Clerk
        const data = await getPerformanceData(userId);
        setPerformance(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    }

    fetchPerformance();
  }, []);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-800">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold">Performance Chart</h2>
      {performance.length > 0 ? (
        <ul>
          {performance.map((entry, index) => (
            <li key={index} className="text-gray-600">
              {entry.date}: ${entry.value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No performance data available.</p>
      )}
    </div>
  );
}