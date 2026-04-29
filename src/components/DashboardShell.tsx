"use client";

import { useState } from "react";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import AdSenseAd from "@/src/components/AdSenseAd";
import AnalyticsDashboard from "@/src/components/AnalyticsDashboard";
import ConnectPlaidButton from "@/src/components/ConnectPlaidButton";
import ConnectedAccounts from "@/src/components/ConnectedAccounts";
import PerformanceChart from "@/src/components/PerformanceChart";
import PortfolioSummary from "@/src/components/PortfolioSummary";
import TransactionTable from "@/src/components/TransactionTable";
import { useUser } from "@/src/hooks/useUser";

type DashboardTab = "overview" | "analytics" | "activity" | "connections";

const tabs: Array<{ id: DashboardTab; label: string; eyebrow: string; title: string; description: string }> = [
  {
    id: "overview",
    label: "Overview",
    eyebrow: "Live wealth overview",
    title: "Calm, clear visibility across your portfolio.",
    description: "A concise dashboard for holdings, recent activity, and current value without the spreadsheet fog.",
  },
  {
    id: "analytics",
    label: "Analytics",
    eyebrow: "Portfolio intelligence",
    title: "Allocation, exposure, and concentration at a glance.",
    description: "Visual breakdowns that help you understand where your capital is actually sitting.",
  },
  {
    id: "activity",
    label: "Activity",
    eyebrow: "Transactions",
    title: "Synced activity across your connected accounts.",
    description: "Review recent investment transactions as Plaid makes them available.",
  },
  {
    id: "connections",
    label: "Connections",
    eyebrow: "Brokerage links",
    title: "Manage the accounts powering your dashboard.",
    description: "Sync, reconnect, or disconnect Plaid-powered brokerage connections.",
  },
];

export default function DashboardShell() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const activeTabContent = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const { userId } = useUser();
  const leftAdSlot = process.env.NEXT_PUBLIC_ADSENSE_LEFT_SLOT;
  const rightAdSlot = process.env.NEXT_PUBLIC_ADSENSE_RIGHT_SLOT;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-stone-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-12rem] top-[-10rem] h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-slate-300/50 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-[116rem] gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 min-[1800px]:grid-cols-[10rem_minmax(0,92rem)_10rem]">
        <AdSenseAd slot={leftAdSlot} label="Left advertisement" />

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="dashboard-card h-fit lg:sticky lg:top-6 lg:min-h-[calc(100vh-3rem)]">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-sm font-black tracking-tight text-[#f4efe7] shadow-xl shadow-stone-900/10">
                PA
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Portfolio</span>
                <span className="block font-serif text-2xl font-semibold tracking-tight text-stone-950 transition group-hover:text-emerald-800">
                  Aggregation
                </span>
              </span>
            </Link>

            <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:grid lg:overflow-visible lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-2xl px-4 py-3 text-left text-sm font-black transition lg:shrink ${
                    activeTab === tab.id
                      ? "bg-stone-950 text-[#f8f2e8] shadow-xl shadow-stone-900/10"
                      : "bg-white/45 text-stone-600 hover:bg-white/80 hover:text-stone-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 lg:mt-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">Next sync</p>
              <p className="mt-2 text-sm leading-6 text-emerald-900">Use Connections to manually sync now. Scheduled sync runs daily once deployed.</p>
            </div>
          </aside>

        <div className="min-w-0">
          <header className="mb-4 flex flex-col justify-between gap-5 rounded-[1.5rem] border border-white/70 bg-white/35 p-5 shadow-2xl shadow-stone-900/10 backdrop-blur-xl sm:mb-6 sm:rounded-[2rem] sm:p-7 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800 sm:mb-4 sm:text-sm sm:tracking-[0.32em]">{activeTabContent.eyebrow}</p>
              <h1 className="max-w-4xl font-serif text-[2rem] font-semibold leading-[1] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
                {activeTabContent.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600">{activeTabContent.description}</p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto lg:justify-end">
              <SignedIn>
                <ConnectPlaidButton />
                <Link href="/profile" className="rounded-full border border-stone-300/80 bg-white/45 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm backdrop-blur transition hover:border-stone-400 hover:bg-white/75">
                  Profile
                </Link>
                <SignOutButton>
                  <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-950">
                    Sign out
                  </button>
                </SignOutButton>
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-950">
                  Sign in
                </Link>
              </SignedOut>
            </div>
          </header>

          <div key={userId ?? "signed-out"}>
          {activeTab === "overview" ? (
            <main className="grid gap-6 lg:grid-cols-12">
              <section className="lg:col-span-7"><PortfolioSummary /></section>
              <section className="lg:col-span-5"><PerformanceChart /></section>
            </main>
          ) : null}

          {activeTab === "analytics" ? <AnalyticsDashboard /> : null}

          {activeTab === "activity" ? (
            <main className="grid gap-6">
              <TransactionTable />
              <PerformanceChart />
            </main>
          ) : null}

          {activeTab === "connections" ? <ConnectedAccounts /> : null}
          </div>
        </div>
        </div>

        <AdSenseAd slot={rightAdSlot} label="Right advertisement" />
      </div>
    </div>
  );
}
