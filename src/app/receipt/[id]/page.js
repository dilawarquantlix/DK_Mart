import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import ReceiptActions from "@/components/ReceiptActions";
import { ReceiptIcon } from "@/components/Icons";
import {
  SHOP_NAME,
  formatMoney,
  formatQuantity,
  formatDateTime,
} from "@/lib/shop-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Receipt ${id.toUpperCase()} — ${SHOP_NAME}` };
}

export default async function ReceiptPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 dark:from-[#070810] dark:to-[#0b0d1a] print:bg-white print:py-0">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden print:hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <ReceiptActions />

        <article className="receipt-doc mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0f1220] print:border-0 print:shadow-none">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-6 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                <ReceiptIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold leading-tight">{SHOP_NAME}</p>
                <p className="text-xs font-medium uppercase tracking-widest text-white/80">
                  Receipt
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Receipt no.
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  #{order.id.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Date
                </p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 text-center font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Rate</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200 dark:divide-white/10">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-2 align-top">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        per {item.unit}
                      </p>
                    </td>
                    <td className="whitespace-nowrap py-3 text-center align-top text-slate-700 dark:text-slate-200">
                      {formatQuantity(item.quantity)} {item.unit}
                    </td>
                    <td className="whitespace-nowrap py-3 text-right align-top text-slate-700 dark:text-slate-200">
                      {formatMoney(item.price)}
                    </td>
                    <td className="whitespace-nowrap py-3 text-right align-top font-semibold text-slate-900 dark:text-white">
                      {formatMoney(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-total mt-5 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white dark:bg-white dark:text-slate-900">
              <span className="text-sm font-medium opacity-80">
                Total payable
              </span>
              <span className="text-2xl font-bold">
                {formatMoney(order.total)}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Thank you for shopping at {SHOP_NAME}!
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                We truly appreciate your visit — please come again.
              </p>
            </div>

            <p className="mt-4 text-center text-[11px] uppercase tracking-widest text-slate-400">
              Powered by {SHOP_NAME}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
