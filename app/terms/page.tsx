import type { Metadata } from "next";
import PublicPageShell from "@/src/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Terms | Portfolio Aggregation",
  description: "Terms for using Portfolio Aggregation.",
};

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="Terms"
      title="A clear dashboard, with clear boundaries."
      description="These terms describe the basic expectations for using Portfolio Aggregation."
    >
      <div className="space-y-8 text-stone-700">
        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Use of the service</h2>
          <p className="mt-3 leading-7">
            Portfolio Aggregation is intended to help you organize and view portfolio information from connected platforms. You are responsible for keeping your account access secure and for using the service lawfully.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">No financial advice</h2>
          <p className="mt-3 leading-7">
            Portfolio Aggregation provides informational dashboard views only. It does not provide investment, tax, legal, trading, or financial planning advice, and it does not guarantee investment outcomes.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Data accuracy</h2>
          <p className="mt-3 leading-7">
            Portfolio data can depend on third-party providers, account availability, market timing, and sync status. You should verify important financial information directly with the relevant financial institution.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Third-party services</h2>
          <p className="mt-3 leading-7">
            The app may rely on services such as Clerk, Supabase, Plaid, and Google AdSense. Those services may have their own terms and privacy practices.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Changes</h2>
          <p className="mt-3 leading-7">
            These terms may be updated as the product changes. Continued use of the service means you accept the latest version.
          </p>
        </section>
      </div>
    </PublicPageShell>
  );
}
