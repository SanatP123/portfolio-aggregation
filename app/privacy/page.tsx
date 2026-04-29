import type { Metadata } from "next";
import Link from "next/link";
import PublicPageShell from "@/src/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Portfolio Aggregation",
  description: "How Portfolio Aggregation handles account, connection, and portfolio data.",
};

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Privacy policy"
      title="Your financial view should feel clear and respectfully handled."
      description="This policy explains the types of information Portfolio Aggregation uses to provide a connected portfolio dashboard."
    >
      <div className="space-y-8 text-stone-700">
        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Information we use</h2>
          <p className="mt-3 leading-7">
            Portfolio Aggregation may use account profile information, authentication details, connected brokerage metadata, holdings, transaction history, balances, and sync timestamps to display your portfolio dashboard.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Connected accounts</h2>
          <p className="mt-3 leading-7">
            Brokerage connections are powered by Plaid. Portfolio Aggregation uses connected data to show portfolio value, allocation, account status, and recent investment activity. We do not provide financial advice or trade execution.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Advertising</h2>
          <p className="mt-3 leading-7">
            This site may use Google AdSense to display ads. Google and its partners may place and read cookies, use web beacons, collect IP addresses, or use other identifiers to serve ads, measure ad performance, prevent fraud, and support ad personalization where permitted.
          </p>
          <p className="mt-3 leading-7">
            Third-party vendors, including Google, may use cookies to serve ads based on a user&apos;s prior visits to this site or other websites. You can manage ad personalization through your Google account settings and learn more about how Google uses information from sites or apps that use its services.
          </p>
          <Link
            href="https://policies.google.com/technologies/partner-sites"
            className="mt-4 inline-flex text-sm font-black text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 transition hover:text-emerald-950"
          >
            How Google uses data from partner sites
          </Link>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Cookies and similar technologies</h2>
          <p className="mt-3 leading-7">
            Cookies and similar technologies may be used for sign-in, security, connected account functionality, analytics, and advertising. Some cookies are necessary for the app to work, while others support measurement or advertising features.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Data choices</h2>
          <p className="mt-3 leading-7">
            You can disconnect linked accounts from the dashboard where connection controls are available. You may also contact us to ask about data access or deletion requests.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-3xl font-semibold text-stone-950">Contact</h2>
          <p className="mt-3 leading-7">
            For privacy questions, use the contact page. This policy may be updated as the product evolves.
          </p>
        </section>
      </div>
    </PublicPageShell>
  );
}
