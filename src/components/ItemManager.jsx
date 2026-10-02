"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { saveItemAction, deleteItemAction } from "@/app/items/actions";
import { UNITS, formatMoney } from "@/lib/shop-config";
import {
  Plus,
  Pencil,
  Trash,
  X,
  Loader,
  Package,
  Check,
} from "./Icons";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

function ItemForm({ item, onCancel, onDone }) {
  const [state, formAction, pending] = useActionState(saveItemAction, {});
  const formRef = useRef(null);
  const uid = useId();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      onDone?.();
    }
  }, [state, onDone]);

  const unitOptions =
    item?.unit && !UNITS.includes(item.unit)
      ? [item.unit, ...UNITS]
      : UNITS;

  return (
    <form ref={formRef} action={formAction} className="mt-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor={`${uid}-name`} className={labelClass}>
            Item name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            required
            maxLength={60}
            defaultValue={item?.name ?? ""}
            placeholder="e.g. Cooking Oil"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${uid}-unit`} className={labelClass}>
            Unit
          </label>
          <select
            id={`${uid}-unit`}
            name="unit"
            defaultValue={item?.unit ?? "kg"}
            className={fieldClass}
          >
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-price`} className={labelClass}>
            Price (PKR)
          </label>
          <input
            id={`${uid}-price`}
            name="price"
            type="number"
            required
            min="0"
            step="0.01"
            inputMode="decimal"
            defaultValue={item?.price ?? ""}
            placeholder="0"
            className={fieldClass}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : item ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {item ? "Save" : "Add"}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {state?.error ? (
        <p className="mt-3 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function ItemRow({ item, onEdit }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  function remove() {
    setError("");
    startTransition(async () => {
      const response = await deleteItemAction(item.id);
      if (!response.ok) {
        setError(response.error);
        setConfirming(false);
      }
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur transition dark:border-white/10 dark:bg-white/[0.03] ${
        pending ? "opacity-60" : ""
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
          per {item.unit}
        </p>
      </div>

      <p className="font-semibold text-slate-900 dark:text-white">
        {formatMoney(item.price)}
      </p>

      {confirming ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={remove}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            {pending ? "Deleting..." : "Delete"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${item.name}`}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      )}

      {error ? (
        <p className="w-full text-xs font-medium text-rose-500">{error}</p>
      ) : null}
    </div>
  );
}

export default function ItemManager({ items }) {
  const [editingId, setEditingId] = useState(null);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Manage items
          </h1>
          <p className="mt-1 max-w-lg text-sm text-slate-500 dark:text-slate-400">
            Add, edit or remove the products in your shop. Prices update on the
            shop calculator instantly.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <Package className="h-3.5 w-3.5 text-violet-500" />
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Plus className="h-4 w-4 text-violet-500" />
          Add a new item
        </div>
        <ItemForm />
      </section>

      <section className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              No items yet
            </h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Add your first product above to start billing.
            </p>
          </div>
        ) : (
          items.map((item) =>
            editingId === item.id ? (
              <div
                key={item.id}
                className="rounded-2xl border border-violet-300 bg-violet-50/70 p-4 dark:border-violet-400/30 dark:bg-violet-500/10"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Pencil className="h-4 w-4 text-violet-500" />
                  Editing “{item.name}”
                </div>
                <ItemForm
                  item={item}
                  onCancel={() => setEditingId(null)}
                  onDone={() => setEditingId(null)}
                />
              </div>
            ) : (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={(target) => setEditingId(target.id)}
              />
            )
          )
        )}
      </section>
    </div>
  );
}
