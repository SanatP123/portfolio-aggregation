import Link from "next/link";
import type { ReactNode } from "react";
import PublicFooter from "@/src/components/PublicFooter";

type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function PublicPageShell({ eyebrow, title, description, children }: PublicPageShellProps) {
  return (
    <main className="min-h-screen bg-[#f4efe7] text-stone-950">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-sm font-black tracking-tight text-[#f4efe7] shadow-xl shadow-stone-900/10">
            PA
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.26em] text-stone-500">Portfolio</span>
            <span className="block font-serif text-2xl font-semibold text-stone-950">Aggregation</span>
          </span>
        </Link>

        <Link href="/sign-in" className="rounded-full border border-stone-300 bg-white/55 px-4 py-2 text-sm font-bold text-stone-800 transition hover:border-stone-400 hover:bg-white/85">
          Sign in
        </Link>
      </nav>

      <section className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-14">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-800">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl font-semibold leading-[0.98] text-stone-950 sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">{description}</p>

        <div className="mt-10 rounded-[2rem] border border-white/75 bg-white/55 p-5 shadow-2xl shadow-stone-900/10 backdrop-blur-xl sm:p-8">
          {children}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
