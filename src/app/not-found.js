import Link from "next/link";
import { ArrowLeft } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 px-4 dark:from-[#070810] dark:to-[#0b0d1a]">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-5xl font-bold text-transparent">
          404
        </p>
        <h1 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
          Receipt not found
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This link may be incorrect or the receipt has expired.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-fuchsia-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
      </div>
    </div>
  );
}
