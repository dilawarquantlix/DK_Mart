"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatMoney, formatQuantity } from "@/lib/shop-config";
import { createOrderAction } from "@/app/actions";
import {
  Plus,
  Minus,
  ShoppingCart,
  Package,
  QrCode,
  Loader,
  Check,
  Copy,
  ExternalLink,
  X,
} from "./Icons";

export default function ShopCalculator({ items }) {
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const quantity = quantities[item.id] ?? 0;
          return {
            ...item,
            quantity,
            lineTotal: Math.round(quantity * item.price * 100) / 100,
          };
        })
        .filter((line) => line.quantity > 0),
    [items, quantities]
  );

  const total =
    Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) /
    100;

  function setQuantity(id, value) {
    const next = Number.isFinite(value)
      ? Math.max(0, Math.min(value, 10000))
      : 0;
    setQuantities((current) => ({ ...current, [id]: next }));
  }

  function submit() {
    if (lines.length === 0) {
      setError("Add at least one item to the order.");
      return;
    }

    setError("");
    const lineItems = lines.map((line) => ({
      id: line.id,
      quantity: line.quantity,
    }));

    startTransition(async () => {
      const response = await createOrderAction(lineItems);
      if (response.ok) {
        setResult(response);
      } else {
        setError(response.error);
      }
    });
  }

  function reset() {
    setQuantities({});
    setResult(null);
    setError("");
    setCopied(false);
  }

  function copyUrl() {
    if (!result?.receiptUrl) return;
    navigator.clipboard
      ?.writeText(result.receiptUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Shop calculator &amp;{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              receipt QR
            </span>
          </h1>
          <p className="mt-1 max-w-lg text-sm text-slate-500 dark:text-slate-400">
            Tap an item to set the quantity, then generate a QR code the customer
            can scan to view their receipt.
          </p>
        </div>

        <Link
          href="/items"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white sm:self-auto dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <Package className="h-4 w-4" />
          Manage items
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
            No items in your shop
          </h3>
          <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Add products before you start billing customers.
          </p>
          <Link
            href="/items"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-fuchsia-500"
          >
            <Plus className="h-4 w-4" />
            Add items
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="space-y-3 lg:col-span-2">
            {items.map((item) => {
              const quantity = quantities[item.id] ?? 0;
              const selected = quantity > 0;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                    selected
                      ? "border-violet-300 bg-violet-50/70 dark:border-violet-400/30 dark:bg-violet-500/10"
                      : "border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/[0.03]"
                  }`}
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-semibold text-white">
                    {item.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatMoney(item.price)} / {item.unit}
                    </p>
                  </div>

                  {selected ? (
                    <span className="hidden text-right text-sm font-semibold text-slate-900 sm:block dark:text-white">
                      {formatMoney(quantity * item.price)}
                    </span>
                  ) : null}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, quantity - 1)}
                      disabled={quantity <= 0}
                      aria-label={`Decrease ${item.name}`}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={quantity === 0 ? "" : quantity}
                      onChange={(event) =>
                        setQuantity(item.id, Number(event.target.value))
                      }
                      aria-label={`${item.name} quantity`}
                      placeholder="0"
                      className="h-9 w-16 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, quantity + 1)}
                      aria-label={`Increase ${item.name}`}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <aside className="lg:col-span-1">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur lg:sticky lg:top-6 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <ShoppingCart className="h-4 w-4 text-violet-500" />
                Order summary
              </div>

              {lines.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No items selected yet. Tap a quantity to start.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {lines.map((line) => (
                    <li
                      key={line.id}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {line.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatQuantity(line.quantity)} {line.unit} ×{" "}
                          {formatMoney(line.price)}
                        </p>
                      </div>
                      <span className="whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                        {formatMoney(line.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-200 pt-4 dark:border-white/10">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatMoney(total)}
                </span>
              </div>

              {error ? (
                <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={submit}
                disabled={pending || lines.length === 0}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4" />
                )}
                Generate receipt QR
              </button>
            </div>
          </aside>
        </div>
      )}

      {result?.ok ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={reset}
            className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-6 text-center shadow-2xl animate-pop-in dark:border-white/10 dark:bg-[#0f1220]">
            <button
              type="button"
              onClick={reset}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
              Receipt ready
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ask the customer to scan this QR code.
            </p>

            <div className="mx-auto mt-5 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10">
              <Image
                src={result.qrDataUrl}
                alt="Receipt QR code"
                width={360}
                height={360}
                unoptimized
                className="h-full w-full"
              />
            </div>

            <div className="mt-5 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Items</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.itemCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Total</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatMoney(result.total)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-left dark:bg-white/5">
              <span className="min-w-0 flex-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {result.receiptUrl}
              </span>
              <button
                type="button"
                onClick={copyUrl}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-white dark:text-slate-300 dark:hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              <a
                href={result.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <ExternalLink className="h-4 w-4" />
                Open receipt
              </a>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                New order
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
