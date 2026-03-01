"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmDialog } from "components/admin/confirm-dialog";
import { deleteCategory } from "lib/admin/category-actions";
import type { Category } from "lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Deterministic gradient per category title
const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-red-700",
  "from-cyan-500 to-sky-700",
  "from-pink-500 to-rose-700",
  "from-fuchsia-500 to-violet-700",
  "from-sky-500 to-blue-700",
  "from-lime-500 to-green-700",
  "from-orange-500 to-red-600",
  "from-teal-500 to-cyan-700",
  "from-indigo-500 to-violet-700",
  "from-green-500 to-emerald-700",
  "from-yellow-500 to-amber-700",
  "from-red-500 to-rose-700",
  "from-purple-500 to-fuchsia-700",
  "from-blue-600 to-cyan-600",
  "from-emerald-600 to-lime-600",
  "from-pink-600 to-fuchsia-600",
  "from-amber-600 to-yellow-500",
  "from-sky-600 to-indigo-600",
  "from-rose-600 to-pink-600",
  "from-teal-600 to-emerald-600",
];

function getGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) & 0xffff;
  }
  return GRADIENTS[hash % GRADIENTS.length]!;
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  count,
  onDelete,
  deleting,
}: {
  cat: Category;
  count: number;
  onDelete: () => void;
  deleting: boolean;
}) {
  const gradient = getGradient(cat.title);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow transition-all duration-300 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900">

      {/* ── Visual area ─────────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-5 pb-5 pt-6`}>
        {/* Product count badge */}
        <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
          {count} {count === 1 ? "producto" : "productos"}
        </span>

        {/* Large initial letter */}
        <p className="select-none text-5xl font-extrabold tracking-tight text-white/90">
          {cat.title.charAt(0).toUpperCase()}
        </p>

        {/* Category label */}
        <p className="mt-2 text-xs font-medium uppercase tracking-widest text-white/50">
          categoría
        </p>

        {/* Full title */}
        <p className="mt-0.5 truncate text-base font-semibold text-white/80">
          {cat.title}
        </p>

        {/* Subtle bottom overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* ── Description bar — stacked: title then actions ───────────────────── */}
      <div className="flex flex-col gap-2 px-3 py-3">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {cat.title}
        </p>
        <div className="flex items-center justify-end gap-1.5 border-t border-neutral-200 pt-1 dark:border-neutral-700">
          <Link
            href={`/admin/categories/${cat.id}/edit`}
            aria-label="Editar categoría"
            className="inline-flex items-center rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-primary hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-primary dark:hover:text-white"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            aria-label="Eliminar categoría"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-destructive dark:hover:text-white"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export function CategoryTable({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmCat, setConfirmCat] = useState<Category | null>(null);

  async function handleDelete(cat: Category) {
    setDeletingId(cat.id);
    const result = await deleteCategory(cat.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoría eliminada.");
      router.refresh();
    }
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-lg font-medium">Aún no hay categorías.</p>
        <Link
          href="/admin/categories/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Crea tu primera categoría →
        </Link>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmCat !== null}
        title="Eliminar categoría"
        message={`¿Eliminar "${confirmCat?.title}"? Los productos asociados quedarán sin categoría.`}
        onClose={() => setConfirmCat(null)}
        onConfirm={() => confirmCat && handleDelete(confirmCat)}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            count={productCounts[cat.title] ?? 0}
            onDelete={() => setConfirmCat(cat)}
            deleting={deletingId === cat.id}
          />
        ))}
      </div>
    </>
  );
}
