"use client";

import { PlusIcon } from "@heroicons/react/24/solid";
import { useCart } from "components/cart/cart-context";
import Price from "components/price";
import type { Product } from "lib/types";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  /** Destination when the image area is clicked. Defaults to /product/[slug]. */
  href?: string;
  /**
   * Admin action buttons rendered in the description bar.
   * When provided, the layout switches to the stacked admin style.
   */
  actions?: React.ReactNode;
  /** Show the Activo / Borrador availability badge over the image. */
  showStatus?: boolean;
}

export function ProductCard({
  product,
  href,
  actions,
  showStatus = false,
}: ProductCardProps) {
  const destination = href ?? `/product/${product.slug}`;
  const { addToCart } = useCart();
  const isAdmin = Boolean(actions);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-400 bg-white shadow transition-all duration-300 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {/* Full-area link */}
        <Link
          href={destination}
          prefetch={true}
          className="absolute inset-0 block"
          aria-label={product.title}
        >
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="h-10 w-10 text-neutral-300 dark:text-neutral-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21l6.75-6.75M21 21H3M21 3H3"
                />
              </svg>
            </div>
          )}
        </Link>

        {/* Availability badge — solid colors for legibility (admin only) */}
        {showStatus && (
          <div className="absolute left-2.5 top-2.5 z-10">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow ${
                product.availableForSale
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-500 text-white"
              }`}
            >
              {product.availableForSale ? "Activo" : "Borrador"}
            </span>
          </div>
        )}

        {/* Floating add-to-cart — storefront only, anchored to image bottom-right */}
        {!isAdmin &&
          (product.availableForSale ? (
            <button
              type="button"
              aria-label="Agregar a la cesta"
              onClick={() => addToCart(product)}
              className="absolute bottom-2.5 right-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all duration-150 hover:scale-110 active:scale-90"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          ) : (
            <span className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-neutral-800 px-2.5 py-1 text-[10px] font-semibold text-white shadow">
              Sin stock
            </span>
          ))}
      </div>

      {/* ── Description bar ────────────────────────────────────────────────── */}
      {isAdmin ? (
        /* Admin: title → price → actions (fully stacked) */
        <div className="flex flex-col gap-1 px-3 py-3">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {product.title}
          </p>
          <Price
            amount={product.price.amount}
            currencyCode={product.price.currencyCode}
            className="text-sm font-semibold text-primary"
          />
          <div className="flex items-center justify-end gap-0.5 pt-0.5 border-t border-neutral-300 dark:border-neutral-600">
            {actions}
          </div>
        </div>
      ) : (
        /* Storefront: title → price (CTA floats on image) */
        <div className="flex flex-col gap-0.5 px-3 py-3">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {product.title}
          </p>
          <Price
            amount={product.price.amount}
            currencyCode={product.price.currencyCode}
            className="text-sm font-semibold text-primary"
          />
        </div>
      )}
    </div>
  );
}
