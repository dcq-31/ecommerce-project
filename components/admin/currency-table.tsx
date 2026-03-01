"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmDialog } from "components/admin/confirm-dialog";
import { deleteCurrency } from "lib/admin/currency-actions";
import type { Currency } from "lib/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Deterministic gradient per currency name
const GRADIENTS = [
  "from-indigo-500 to-blue-700",
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-yellow-700",
  "from-rose-500 to-red-700",
  "from-violet-500 to-purple-700",
  "from-sky-500 to-blue-700",
  "from-pink-500 to-rose-700",
  "from-fuchsia-500 to-violet-700",
  "from-lime-500 to-green-700",
  "from-orange-500 to-red-600",
  "from-teal-500 to-cyan-700",
  "from-green-500 to-emerald-700",
  "from-yellow-500 to-amber-700",
  "from-red-500 to-rose-700",
  "from-purple-500 to-fuchsia-700",
  "from-cyan-500 to-sky-700",
  "from-blue-600 to-cyan-600",
  "from-emerald-600 to-lime-600",
  "from-pink-600 to-fuchsia-600",
  "from-amber-600 to-yellow-500",
  "from-sky-600 to-indigo-600",
  "from-rose-600 to-pink-600",
  "from-teal-600 to-emerald-600",
  "from-indigo-600 to-violet-600",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return GRADIENTS[hash % GRADIENTS.length]!;
}

// ─── Currency card ─────────────────────────────────────────────────────────────

function CurrencyCard({
  cur,
  onDelete,
  deleting,
}: {
  cur: Currency;
  onDelete: () => void;
  deleting: boolean;
}) {
  const gradient = cur.isBase
    ? "from-slate-600 to-slate-800"
    : getGradient(cur.name);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow transition-all duration-300 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
      {/* ── Visual area ─────────────────────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-5 pb-5 pt-6`}
      >
        {/* Base badge */}
        {cur.isBase && (
          <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            base
          </span>
        )}

        {/* Image icon (if present) or abbreviation text */}
        {cur.imageUrl ? (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={cur.imageUrl}
                alt={cur.name}
                fill
                className="object-contain p-1"
              />
            </div>
            <p className="select-none font-mono text-3xl font-extrabold tracking-tight text-white/90">
              {cur.name}
            </p>
          </div>
        ) : (
          <p className="select-none font-mono text-4xl font-extrabold tracking-tight text-white/90">
            {cur.name}
          </p>
        )}

        {/* Rate line */}
        <p className="mt-2 text-xs font-medium text-white/50 uppercase tracking-widest">
          {cur.isBase ? "moneda base" : "cambio"}
        </p>
        <p className="mt-0.5 font-mono text-xl font-semibold text-white/80">
          {cur.isBase
            ? "1.00"
            : cur.rate.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
        </p>

        {/* Subtle bottom overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* ── Action bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-3 py-3">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {cur.name}
        </p>
        <div className="flex items-center justify-end gap-1.5 border-t border-neutral-200 pt-1 dark:border-neutral-700">
          <Link
            href={`/admin/currencies/${cur.id}/edit`}
            aria-label="Editar moneda"
            className="inline-flex items-center rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-primary hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-primary dark:hover:text-white"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
          </Link>
          {!cur.isBase && (
            <button
              type="button"
              aria-label="Eliminar moneda"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-destructive dark:hover:text-white"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Grid ──────────────────────────────────────────────────────────────────────

export function CurrencyTable({ currencies }: { currencies: Currency[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmCur, setConfirmCur] = useState<Currency | null>(null);

  async function handleDelete(cur: Currency) {
    setDeletingId(cur.id);
    const result = await deleteCurrency(cur.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Moneda eliminada.");
      router.refresh();
    }
  }

  if (currencies.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-lg font-medium">Aún no hay monedas.</p>
        <Link
          href="/admin/currencies/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Crea tu primera moneda →
        </Link>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmCur !== null}
        title="Eliminar moneda"
        message={`¿Eliminar la moneda "${confirmCur?.name}"? Esta acción no se puede deshacer.`}
        onClose={() => setConfirmCur(null)}
        onConfirm={() => confirmCur && handleDelete(confirmCur)}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {currencies.map((cur) => (
          <CurrencyCard
            key={cur.id}
            cur={cur}
            onDelete={() => setConfirmCur(cur)}
            deleting={deletingId === cur.id}
          />
        ))}
      </div>
    </>
  );
}
