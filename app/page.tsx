import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import DashboardShell from "@/src/components/DashboardShell";
import PublicFooter from "@/src/components/PublicFooter";

const platformBenefits = [
  {
    title: "One calm portfolio view",
    description: "Bring scattered brokerage data into one readable dashboard for total value, holdings, and account context.",
  },
  {
    title: "Allocation you can understand",
    description: "See concentration, exposure, and position weight without stitching together exports or separate tabs.",
  },
  {
    title: "Performance context",
    description: "Track synced value over time so portfolio movement feels easier to follow and easier to discuss.",
  },
];

const trustPoints = [
  "Secure sign-in with Clerk",
  "Plaid-powered brokerage connections",
  "Read-focused dashboard experience",
  "Clear account and connection controls",
];

const workflowSteps = [
  {
    step: "Connect",
    title: "Link supported brokerage accounts",
    description: "Use Plaid-powered connections to bring eligible investment account data into one organized workspace.",
  },
  {
    step: "Review",
    title: "See total value and allocation",
    description: "Understand current portfolio value, account coverage, holdings, and concentration from a single dashboard.",
  },
  {
    step: "Track",
    title: "Follow activity and performance",
    description: "Use synced activity and value context to keep a calmer eye on changes over time.",
  },
];

export default function Home() {
  return (
    <>
      <SignedIn>
        <DashboardShell />
      </SignedIn>

      <SignedOut>
        <main className="min-h-screen overflow-x-hidden bg-[#f4efe7] text-stone-950">
          <section className="relative border-b border-stone-200/80">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(4,120,87,0.18),transparent_34%),radial-gradient(circle_at_85%_8%,rgba(245,158,11,0.22),transparent_28%),linear-gradient(135deg,#f8f2e8_0%,#edf4ef_52%,#f4efe7_100%)]" />

            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-sm font-black tracking-tight text-[#f4efe7] shadow-xl shadow-stone-900/10">
                  PA
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.26em] text-stone-500">Portfolio</span>
                  <span className="block font-serif text-2xl font-semibold text-stone-950">Aggregation</span>
                </span>
              </Link>

              <div className="flex items-center gap-3">
                <Link href="/sign-in" className="hidden text-sm font-bold text-stone-700 transition hover:text-stone-950 sm:inline">
                  Sign in
                </Link>
                <Link href="/sign-up" className="rounded-full bg-stone-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-950">
                  Get started
                </Link>
              </div>
            </nav>

            <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-center lg:px-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-800">Unified portfolio visibility</p>
                <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[0.96] text-stone-950 sm:text-6xl lg:text-7xl">
                  A secure home for your fragmented financial data.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                  Portfolio Aggregation gives you a single view of total portfolio value, allocation, and performance tracking across connected platforms, so your financial picture feels less scattered and easier to trust.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/sign-up" className="rounded-full bg-stone-950 px-6 py-3 text-center text-sm font-black text-white shadow-xl shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-950">
                    Create your view
                  </Link>
                  <Link href="#how-it-helps" className="rounded-full border border-stone-300 bg-white/55 px-6 py-3 text-center text-sm font-black text-stone-800 shadow-sm backdrop-blur transition hover:border-stone-400 hover:bg-white/85">
                    See how it helps
                  </Link>
                </div>

                <p className="mt-5 max-w-xl text-sm leading-6 text-stone-500">
                  Portfolio Aggregation is built for visibility and organization. It does not provide financial advice, trading recommendations, or guarantees about investment performance.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/75 bg-white/55 p-4 shadow-2xl shadow-stone-900/10 backdrop-blur-xl sm:p-6">
                <div className="rounded-[1.5rem] bg-stone-950 p-6 text-[#f8f2e8]">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Total portfolio value</p>
                  <p className="mt-4 font-serif text-5xl font-semibold">$128,420</p>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-stone-400">Cash</p>
                      <p className="mt-1 font-black">$8.2k</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-stone-400">Invested</p>
                      <p className="mt-1 font-black">$120k</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <p className="text-stone-400">Accounts</p>
                      <p className="mt-1 font-black">4</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {["AAPL", "VTI", "MSFT"].map((symbol, index) => (
                    <div key={symbol} className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/70 p-4">
                      <div>
                        <p className="font-black text-stone-950">{symbol}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                          {index === 0 ? "Largest holding" : index === 1 ? "Core ETF" : "Technology"}
                        </p>
                      </div>
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-stone-200">
                        <div className="h-full rounded-full bg-emerald-700" style={{ width: `${78 - index * 18}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-helps" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-800">Less switching, more clarity</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold leading-none text-stone-950 sm:text-5xl">
                Designed for people who want a clear picture without the spreadsheet fog.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {platformBenefits.map((benefit) => (
                <article key={benefit.title} className="rounded-[1.5rem] border border-white/75 bg-white/55 p-6 shadow-xl shadow-stone-900/5 backdrop-blur">
                  <h3 className="font-serif text-2xl font-semibold text-stone-950">{benefit.title}</h3>
                  <p className="mt-3 leading-7 text-stone-600">{benefit.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-y border-stone-200/80 bg-white/35">
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-800">Comfort and control</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold leading-none text-stone-950 sm:text-5xl">
                  A dashboard that should feel composed, not noisy.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {trustPoints.map((point) => (
                  <div key={point} className="rounded-2xl border border-stone-200/80 bg-[#f8f2e8]/80 p-5 font-bold text-stone-800">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-800">How it works</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold leading-none text-stone-950 sm:text-5xl">
                  From scattered accounts to one composed portfolio picture.
                </h2>
                <p className="mt-5 leading-7 text-stone-600">
                  Portfolio Aggregation is built for visibility, not speculation. The product focuses on organizing synced portfolio data so users can understand what they own, where it sits, and how it changes.
                </p>
              </div>

              <div className="grid gap-4">
                {workflowSteps.map((item) => (
                  <article key={item.step} className="grid gap-4 rounded-[1.5rem] border border-white/75 bg-white/55 p-5 shadow-xl shadow-stone-900/5 backdrop-blur sm:grid-cols-[5rem_minmax(0,1fr)] sm:p-6">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-stone-950 text-sm font-black uppercase tracking-[0.18em] text-[#f8f2e8]">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-stone-950">{item.title}</h3>
                      <p className="mt-2 leading-7 text-stone-600">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <PublicFooter />
        </main>
      </SignedOut>
    </>
  );
}
