import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import type { Product } from "lib/types";

export function ProductDescription({ product }: { product: Product }) {
  return (
    <div className="flex flex-col">
      {/* Category chip */}
      {product.category && (
        <span className="mb-4 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {product.category}
        </span>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white lg:text-4xl">
        {product.title}
      </h1>

      {/* Price */}
      <div className="mt-5">
        <Price
          amount={product.price.amount}
          currencyCode={product.price.currencyCode}
          className="text-2xl font-bold text-neutral-900 dark:text-white"
          currencyCodeClassName="text-base font-medium text-neutral-400 dark:text-neutral-500"
        />
      </div>

      <div className="my-6 border-t border-neutral-400 dark:border-neutral-600" />

      <AddToCart product={product} />
    </div>
  );
}
