import type { Metadata } from "next";
import Link from "next/link";
import PublicPageShell from "@/src/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Contact | Portfolio Aggregation",
  description: "Contact Portfolio Aggregation for support, privacy, or product questions.",
};

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="Contact"
      title="Questions should have a calm place to land."
      description="Use this page for support, privacy questions, and product feedback while Portfolio Aggregation continues to grow."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <section className="rounded-[1.5rem] border border-stone-200/80 bg-[#f8f2e8]/80 p-5">
          <h2 className="font-serif text-2xl font-semibold text-stone-950">Support</h2>
          <p className="mt-3 leading-7 text-stone-700">
            For account, connection, or dashboard questions, include the page you were using and what you expected to happen.
          </p>
        </section>

        <section className="rounded-[1.5rem] border border-stone-200/80 bg-[#f8f2e8]/80 p-5">
          <h2 className="font-serif text-2xl font-semibold text-stone-950">Privacy</h2>
          <p className="mt-3 leading-7 text-stone-700">
            For privacy or data requests, mention the email address associated with your account so the request can be reviewed.
          </p>
        </section>

        <section className="rounded-[1.5rem] border border-stone-200/80 bg-[#f8f2e8]/80 p-5">
          <h2 className="font-serif text-2xl font-semibold text-stone-950">Feedback</h2>
          <p className="mt-3 leading-7 text-stone-700">
            Product feedback is welcome, especially around portfolio clarity, allocation views, and connection management.
          </p>
        </section>
      </div>

      <div className="mt-8 rounded-[1.5rem] bg-stone-950 p-6 text-[#f8f2e8]">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">Contact channel</p>
        <p className="mt-3 leading-7 text-stone-200">
          For support, privacy, or product questions, email sanatclaude@gmail.com.
        </p>
        <Link href="mailto:sanatclaude@gmail.com" className="mt-5 inline-flex rounded-full bg-[#f8f2e8] px-5 py-3 text-sm font-black text-stone-950 transition hover:-translate-y-0.5">
          Email support
        </Link>
      </div>
    </PublicPageShell>
  );
}
