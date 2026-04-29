import type { Metadata } from "next";
import Link from "next/link";
import PublicPageShell from "@/src/components/PublicPageShell";

export const metadata: Metadata = {
  title: "About | Portfolio Aggregation",
  description: "Learn what Portfolio Aggregation does, why it exists, and what it does not provide.",
};

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="About"
      title="Portfolio Aggregation exists to make scattered portfolio data easier to understand."
      description="The platform is built around one simple idea: users should be able to see their connected portfolio picture without jumping across accounts, spreadsheets, and disconnected reports."
    >
      <div className="space-y-8 text-stone-700">
        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">What Portfolio Aggregation does</h2>
          <p className="mt-3 leading-7">
            Portfolio Aggregation helps users view connected investment account data in one place, including total portfolio value, account coverage, holdings, allocation, recent activity, and performance context.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Why it exists</h2>
          <p className="mt-3 leading-7">
            Financial data often lives across multiple brokerages, apps, and statements. Portfolio Aggregation exists to reduce that fragmentation and give users a calmer way to understand what they own and where it sits.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">What it does not do</h2>
          <p className="mt-3 leading-7">
            Portfolio Aggregation does not provide investment advice, tax advice, legal advice, trading recommendations, trade execution, or guarantees about investment performance. Important financial decisions should be verified with qualified professionals and your financial institutions.
          </p>
        </section>

        <section className="rounded-[1.5rem] bg-stone-950 p-6 text-[#f8f2e8]">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">Support</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold">Questions, privacy requests, or feedback?</h2>
          <p className="mt-3 leading-7 text-stone-200">
            Reach support from the contact page for account, connection, privacy, or product questions.
          </p>
          <Link href="/contact" className="mt-5 inline-flex rounded-full bg-[#f8f2e8] px-5 py-3 text-sm font-black text-stone-950 transition hover:-translate-y-0.5">
            Contact support
          </Link>
        </section>
      </div>
    </PublicPageShell>
  );
}
