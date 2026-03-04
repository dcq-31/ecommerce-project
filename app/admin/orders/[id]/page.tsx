import { ArrowLeftIcon, CheckCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { getOrderById } from "lib/admin/order-actions";
import { fmtMoney } from "lib/order";
import { getProduct } from "lib/products";
import type { ProductImage } from "lib/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Pedido ${id} — Admin` };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  // Fetch product images best-effort
  const imageMap = new Map<string, ProductImage | null>();
  await Promise.all(
    order.data.items.map(async (item) => {
      const product = await getProduct(item.slug).catch(() => null);
      imageMap.set(item.slug, product?.featuredImage ?? null);
    }),
  );

  const total =
    order.data.items.reduce((sum, i) => sum + parseFloat(i.bp) * i.qty, 0) *
    order.data.rate;

  const date = new Date(order.data.ts).toLocaleString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateDisplay = date.charAt(0).toUpperCase() + date.slice(1);
  const itemCount = order.data.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-400 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-500 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Pedidos
        </Link>
        <h2 className="font-mono text-2xl font-bold">{order.id}</h2>
      </div>

      <div className="max-w-lg">
        {/* Status row */}
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-5 py-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Pedido recibido
            </p>
            <p className="text-xs text-neutral-400">{dateDisplay}</p>
          </div>
          <span className="ml-auto text-xs text-neutral-400">
            {itemCount} artículo{itemCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Items section */}
        <section className="overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center gap-2 border-b border-neutral-300 px-5 py-3.5 dark:border-neutral-700">
            <ShoppingBagIcon className="h-4 w-4 text-neutral-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Productos
            </h3>
          </div>

          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {order.data.items.map((item) => {
              const image = imageMap.get(item.slug);
              const unitPrice = parseFloat(item.bp) * order.data.rate;
              const lineTotal = unitPrice * item.qty;

              return (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
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

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.t}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      $ {fmtMoney(unitPrice)} {order.data.cur}
                      {item.qty > 1 && (
                        <span className="ml-1">× {item.qty}</span>
                      )}
                    </p>
                  </div>

                  <p className="flex-shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    $ {fmtMoney(lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Summary section */}
        <section className="mt-3 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <dl className="divide-y divide-neutral-200 px-5 dark:divide-neutral-700">
            {order.data.rate !== 1 && (
              <div className="flex items-center justify-between py-3.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Tipo de cambio
                </dt>
                <dd className="font-medium">
                  1 USD = {order.data.rate} {order.data.cur}
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
                  {order.data.cur}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
