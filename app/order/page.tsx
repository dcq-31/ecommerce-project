import { decodeOrder, fmtMoney } from "lib/order";
import { getProduct } from "lib/products";
import type { ProductImage } from "lib/types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}): Promise<Metadata> {
  const { d } = await searchParams;
  const order = d ? decodeOrder(d) : null;
  return {
    title: order ? `Pedido ${order.id}` : "Pedido no encontrado",
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  if (!d) notFound();

  const order = decodeOrder(d);
  if (!order) notFound();

  // Fetch product images server-side (best-effort — image may be null if deleted)
  const imageMap = new Map<string, ProductImage | null>();
  await Promise.all(
    order.items.map(async (item) => {
      const product = await getProduct(item.slug).catch(() => null);
      imageMap.set(item.slug, product?.featuredImage ?? null);
    }),
  );

  const total =
    order.items.reduce((sum, i) => sum + parseFloat(i.bp) * i.qty, 0) *
    order.rate;

  const date = new Date(order.ts).toLocaleString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Capitalise first letter (toLocaleString returns lowercase weekday)
  const dateDisplay = date.charAt(0).toUpperCase() + date.slice(1);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Pedido recibido
        </p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {dateDisplay}
        </p>
      </div>

      {/* ── Items ────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-center gap-2 border-b border-neutral-300 px-5 py-3.5 dark:border-neutral-600">
          <ShoppingBagIcon className="h-4 w-4 text-neutral-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Productos
          </h2>
          <span className="ml-auto text-xs text-neutral-400">
            {order.items.reduce((s, i) => s + i.qty, 0)} artículo
            {order.items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""}
          </span>
        </div>

        <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {order.items.map((item) => {
            const image = imageMap.get(item.slug);
            const unitPrice = parseFloat(item.bp) * order.rate;
            const lineTotal = unitPrice * item.qty;

            return (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                {/* Thumbnail */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText || item.t}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.t}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    $ {fmtMoney(unitPrice)} {order.cur}
                    {item.qty > 1 && <span className="ml-1">× {item.qty}</span>}
                  </p>
                </div>

                {/* Line total */}
                <p className="flex-shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  $ {fmtMoney(lineTotal)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <section className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="divide-y divide-neutral-200 px-5 dark:divide-neutral-700">
          {order.rate !== 1 && (
            <div className="flex items-center justify-between py-3.5 text-sm">
              <dt className="text-neutral-500 dark:text-neutral-400">
                Tipo de cambio
              </dt>
              <dd className="font-medium">
                1 USD = {order.rate} {order.cur}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between py-4">
            <dt className="font-semibold text-neutral-900 dark:text-neutral-100">
              Total
            </dt>
            <dd className="text-lg font-bold text-primary">
              $ {fmtMoney(total)}{" "}
              <span className="text-sm font-medium text-neutral-500">
                {order.cur}
              </span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
