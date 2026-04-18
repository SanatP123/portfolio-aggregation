import Image from "next/image";
import PortfolioSummary from "@/src/components/PortfolioSummary";
import TransactionTable from "@/src/components/TransactionTable";
import PerformanceChart from "@/src/components/PerformanceChart";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header className="p-4 bg-white shadow dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center">Portfolio Dashboard</h1>
      </header>
      <main className="flex flex-col gap-6 p-6">
        <PortfolioSummary />
        <TransactionTable />
        <PerformanceChart />
      </main>
    </div>
  );
}
