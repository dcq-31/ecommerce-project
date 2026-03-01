"use client";

import clsx from "clsx";
import { ConfirmDialog } from "components/admin/confirm-dialog";
import { deleteProduct, toggleProductAvailability } from "lib/admin/actions";
import type { Product } from "lib/types";
import {
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ProductCard } from "components/product-card";
import { toast } from "sonner";

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ─── Admin card actions ───────────────────────────────────────────────────────

function AdminCardActions({ product }: { product: Product }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteProduct(product.id);
    setDeleting(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Producto eliminado.");
      router.refresh();
    }
  }

  async function handleToggle() {
    setToggling(true);
    const next = !product.availableForSale;
    const result = await toggleProductAvailability(product.id, next);
    setToggling(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(next ? "Producto activado." : "Producto desactivado.");
      router.refresh();
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar producto"
        message={`¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
      <div className="flex items-center gap-1">
        <Link
          href={`/admin/products/${product.id}/edit`}
          aria-label="Editar producto"
          title="Editar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-primary dark:hover:bg-primary dark:hover:text-white"
        >
          <PencilSquareIcon className="h-4 w-4" />
        </Link>

        <IconButton
          label={product.availableForSale ? "Desactivar" : "Activar"}
          onClick={handleToggle}
          disabled={toggling}
          className={
            product.availableForSale
              ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "border-neutral-200 bg-neutral-50 text-neutral-400 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 dark:border-neutral-700 dark:bg-neutral-800"
          }
        >
          {product.availableForSale ? (
            <EyeIcon className="h-4 w-4" />
          ) : (
            <EyeSlashIcon className="h-4 w-4" />
          )}
        </IconButton>

        <IconButton
          label="Eliminar producto"
          onClick={() => setConfirmOpen(true)}
          disabled={deleting}
          className="border-neutral-200 bg-neutral-50 text-neutral-500 shadow-sm hover:border-destructive hover:bg-destructive hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
        >
          <TrashIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </>
  );
}

// ─── Category chip ────────────────────────────────────────────────────────────

function CategoryChip({
  label,
  active,
  pending,
  onClick,
}: {
  label: string;
  active: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={clsx(
        "flex-none rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap disabled:cursor-wait",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-primary dark:hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}

// ─── Product grid ─────────────────────────────────────────────────────────────

const UNCATEGORIZED = "Sin categoría";

export function ProductGrid({ products }: { products: Product[] }) {
  const hasUncategorized = products.some((p) => p.category === null);
  const namedCategories = Array.from(
    new Set(
      products
        .filter((p) => p.category !== null)
        .map((p) => p.category!),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const categories = [
    ...(hasUncategorized ? [UNCATEGORIZED] : []),
    ...namedCategories,
  ];

  const [selected, setSelected] = useState(categories[0] ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSelect(category: string) {
    if (category === selected) return;
    startTransition(() => setSelected(category));
  }

  const visible =
    selected === UNCATEGORIZED
      ? products.filter((p) => p.category === null)
      : products.filter((p) => p.category === selected);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-lg font-medium">Aún no hay productos.</p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Crea tu primer producto →
        </Link>
      </div>
    );
  }

  return (
    <section>
      {/* Category chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            active={selected === cat}
            pending={isPending}
            onClick={() => handleSelect(cat)}
          />
        ))}
      </div>

      {/* Grid */}
      <div
        className={clsx(
          "transition-opacity duration-150",
          isPending && "pointer-events-none opacity-50",
        )}
      >
        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showStatus
                actions={<AdminCardActions product={product} />}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-neutral-400">
            No se encontraron productos en esta categoría.
          </div>
        )}
      </div>
    </section>
  );
}
