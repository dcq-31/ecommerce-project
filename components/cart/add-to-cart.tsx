"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { Product } from "lib/types";
import { toast } from "sonner";
import { useCart } from "./cart-context";

export function AddToCart({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-primary p-4 tracking-wide text-primary-foreground";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!product.availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Sin stock
      </button>
    );
  }

  return (
    <button
      aria-label="Agregar al carrito"
      onClick={() => { addToCart(product); toast.success(`${product.title} agregado al carrito.`); }}
      className={clsx(buttonClasses, "hover:opacity-90")}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Agregar al carrito
    </button>
  );
}
