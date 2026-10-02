"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "./Icons";

export default function ReceiptActions() {
  return (
    <div className="flex items-center justify-between gap-3 print:hidden">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        New order
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}
