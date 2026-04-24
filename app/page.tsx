import PortfolioSummary from "@/src/components/PortfolioSummary";
import TransactionTable from "@/src/components/TransactionTable";
import PerformanceChart from "@/src/components/PerformanceChart";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f4efe7] text-stone-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-12rem] top-[-10rem] h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-slate-300/50 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-sm font-black tracking-tight text-[#f4efe7] shadow-xl shadow-stone-900/10">
            PA
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
              Portfolio
            </span>
            <span className="block font-serif text-2xl font-semibold tracking-tight text-stone-950 transition group-hover:text-emerald-800">
              Aggregation
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <SignedIn>
            <Link
              href="/profile"
              className="rounded-full border border-stone-300/80 bg-white/45 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm backdrop-blur transition hover:border-stone-400 hover:bg-white/75"
            >
              Profile
            </Link>
            <SignOutButton>
              <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-950">
                Sign out
              </button>
            </SignOutButton>
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-950"
            >
              Sign in
            </Link>
          </SignedOut>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-12 pt-2 sm:px-8 lg:grid-cols-12 lg:px-10">
        <section className="lg:col-span-12">
          <div className="rounded-[2rem] border border-white/70 bg-white/35 p-6 shadow-2xl shadow-stone-900/10 backdrop-blur-xl sm:p-8">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-emerald-800">
              Live wealth overview
            </p>
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[0.95] tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
                  Calm, clear visibility across your portfolio.
                </h1>
              </div>
              <p className="max-w-md text-base leading-7 text-stone-600">
                A concise dashboard for holdings, recent activity, and current value without the spreadsheet fog.
              </p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <PortfolioSummary />
        </section>
        <section className="lg:col-span-5">
          <PerformanceChart />
        </section>
        <section className="lg:col-span-12">
          <TransactionTable />
        </section>
      </main>
    </div>
  );
}
