import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-4 px-5 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:px-8 lg:px-10">
      <p>Portfolio Aggregation helps organize portfolio data for informational purposes only.</p>
      <div className="flex flex-wrap gap-4 font-bold">
        <Link href="/about" className="hover:text-stone-950">About</Link>
        <Link href="/privacy" className="hover:text-stone-950">Privacy</Link>
        <Link href="/terms" className="hover:text-stone-950">Terms</Link>
        <Link href="/contact" className="hover:text-stone-950">Contact</Link>
      </div>
    </footer>
  );
}
