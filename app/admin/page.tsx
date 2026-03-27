import {
  ArrowRightIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  FolderIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { CopyLinkButton } from "components/admin/copy-link-button";
import { listOrders } from "lib/admin/order-actions";
import { getBanners, getAllProducts, getCategories, getCurrencies } from "lib/products";
import Link from "next/link";
import type { ComponentType } from "react";

export const metadata = { title: "Resumen — Admin" };

async function getDashboardData() {
  const [products, categories, banners, currencies, orders] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getBanners(),
    getCurrencies(),
    listOrders().catch(() => []),
  ]);

  return {
    products: {
      total: products.length,
      available: products.filter((p) => p.availableForSale).length,
      disabled: products.filter((p) => !p.availableForSale).length,
    },
    categories: { total: categories.length },
    banners: { total: banners.length },
    currencies: { total: currencies.length },
    orders: {
      total: orders.length,
      revenueUsd: orders.reduce((s, o) => s + o.totalUsd, 0),
    },
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const fmtUsd = (n: number) =>
    n.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Resumen</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Estado actual de tu tienda
        </p>
      </div>

      {/* Resource cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Productos */}
        <ResourceCard
          href="/admin/products"
          Icon={CubeIcon}
          label="Productos"
          accent="bg-blue-500"
          stats={[
            { value: data.products.total, label: "Total" },
            { value: data.products.available, label: "Activos" },
            { value: data.products.disabled, label: "Inactivos" },
          ]}
        />

        {/* Pedidos */}
        <ResourceCard
          href="/admin/orders"
          Icon={ClipboardDocumentListIcon}
          label="Pedidos"
          accent="bg-emerald-500"
          stats={[
            { value: data.orders.total, label: "Total" },
            { value: `$ ${fmtUsd(data.orders.revenueUsd)}`, label: "Acumulado USD" },
          ]}
        />

        {/* Categorías */}
        <ResourceCard
          href="/admin/categories"
          Icon={FolderIcon}
          label="Categorías"
          accent="bg-violet-500"
          stats={[{ value: data.categories.total, label: "Total" }]}
        />

        {/* Anuncios */}
        <ResourceCard
          href="/admin/banners"
          Icon={PhotoIcon}
          label="Anuncios"
          accent="bg-amber-500"
          stats={[{ value: data.banners.total, label: "Total" }]}
        />

        {/* Monedas */}
        <ResourceCard
          href="/admin/currencies"
          Icon={BanknotesIcon}
          label="Monedas"
          accent="bg-orange-500"
          stats={[{ value: data.currencies.total, label: "Total" }]}
        />

      </div>

      {/* Utilities */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Utilidades
        </h3>
        <div className="rounded-xl border border-neutral-300 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Enlace de la tienda
          </p>
          <CopyLinkButton url="https://supermarket-cienfuegos.vercel.app" />
        </div>
      </div>
    </div>
  );
}

// ─── Resource card ─────────────────────────────────────────────────────────────

function ResourceCard({
  href,
  Icon,
  label,
  accent,
  stats,
}: {
  href: string;
  Icon: ComponentType<{ className?: string }>;
  label: string;
  accent: string;
  stats: { value: string | number; label: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      {/* Accent stripe */}
      <div className={`h-1 ${accent}`} />

      <div className="px-5 pb-5 pt-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {label}
            </span>
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 transition-colors hover:bg-primary hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-primary dark:hover:text-white"
          >
            Gestionar
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
