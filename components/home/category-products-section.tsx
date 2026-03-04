"use client";

import clsx from "clsx";
import { useState, useTransition } from "react";
import { fetchCategoryProducts } from "lib/storefront-actions";
import type { Category, Product } from "lib/types";
import { ProductCard } from "components/product-card";

const ITEMS_PER_PAGE = 8;

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
          : "border border-neutral-400 text-neutral-700 hover:border-primary hover:text-primary dark:border-neutral-500 dark:text-neutral-300 dark:hover:border-primary dark:hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded border border-neutral-400 text-sm disabled:opacity-40 hover:border-primary disabled:hover:border-neutral-400 dark:border-neutral-500 dark:disabled:hover:border-neutral-500"
        aria-label="Página anterior"
      >
        ‹
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded text-sm font-medium transition-colors",
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "border border-neutral-400 hover:border-primary dark:border-neutral-500",
          )}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded border border-neutral-400 text-sm disabled:opacity-40 hover:border-primary disabled:hover:border-neutral-400 dark:border-neutral-500 dark:disabled:hover:border-neutral-500"
        aria-label="Siguiente página"
      >
        ›
      </button>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function CategoryProductsSection({
  categories,
  initialProducts,
  initialCategory,
}: {
  categories: Category[];
  initialProducts: Product[];
  initialCategory: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [products, setProducts] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  function handleCategorySelect(title: string) {
    if (title === selectedCategory) return;
    setSelectedCategory(title);
    setCurrentPage(1);
    startTransition(async () => {
      const newProducts = await fetchCategoryProducts(title);
      setProducts(newProducts);
    });
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8">
      {/* Section header */}
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Categorías
      </h2>

      {/* Horizontal scroll category chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <CategoryChip
            key={cat.slug}
            label={cat.title}
            active={selectedCategory === cat.title}
            pending={isPending}
            onClick={() => handleCategorySelect(cat.title)}
          />
        ))}
      </div>

      {/* Product grid — 2 columns */}
      <div
        className={clsx(
          "transition-opacity duration-150",
          isPending && "opacity-50 pointer-events-none",
        )}
      >
        {paginated.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-neutral-400">
            No se encontraron productos en esta categoría.
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
