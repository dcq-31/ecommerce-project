"use client";

import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmDialog } from "components/admin/confirm-dialog";
import { deleteOrder } from "lib/admin/order-actions";
import { fmtMoney, type StoredOrder } from "lib/order";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ─── Gradient helpers ─────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-blue-500 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-red-700",
  "from-violet-500 to-purple-700",
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
  "from-purple-500 to-fuchsia-700",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  }
  return GRADIENTS[hash % GRADIENTS.length]!;
}

function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onDelete,
  deleting,
}: {
  order: StoredOrder;
  onDelete: () => void;
  deleting: boolean;
}) {
  const gradient = getGradient(order.id);
  const { date, time } = formatDate(order.createdAt);
  const total = order.totalUsd * order.data.rate;
  const itemCount = order.data.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow transition-all duration-300 hover:shadow-xl dark:border-neutral-600 dark:bg-neutral-900">
      {/* ── Gradient header ──────────────────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-5 pb-5 pt-6`}
      >
        {/* Date badge */}
        <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
          {date}
        </span>

        {/* Order ID */}
        <p className="select-none font-mono text-xl font-extrabold tracking-tight text-white/90 sm:text-2xl">
          {order.id}
        </p>

        {/* Total */}
        <p className="mt-2 text-xs font-medium uppercase tracking-widest text-white/50">
          total
        </p>
        <p className="mt-0.5 font-mono text-lg font-semibold text-white/80">
          $ {fmtMoney(total)}{" "}
          <span className="text-sm font-normal">{order.data.cur}</span>
        </p>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* ── Action bar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-3 py-3">
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {time} · {itemCount} artículo{itemCount !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center justify-end gap-1.5 border-t border-neutral-200 pt-2 dark:border-neutral-700">
          <Link
            href={`/admin/orders/${order.id}`}
            aria-label="Ver detalles del pedido"
            className="inline-flex items-center rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-primary hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-primary dark:hover:text-white"
          >
            <EyeIcon className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            aria-label="Eliminar pedido"
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

export function OrderTable({ orders }: { orders: StoredOrder[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<StoredOrder | null>(null);

  async function handleDelete(order: StoredOrder) {
    setDeletingId(order.id);
    const result = await deleteOrder(order.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Pedido eliminado.");
      router.refresh();
    }
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-lg font-medium">Aún no hay pedidos.</p>
        <p className="mt-1 text-sm">
          Los pedidos aparecerán aquí una vez que los clientes confirmen por
          WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmOrder !== null}
        title="Eliminar pedido"
        message={`¿Eliminar el pedido ${confirmOrder?.id}? Esta acción no se puede deshacer.`}
        onClose={() => setConfirmOrder(null)}
        onConfirm={() => confirmOrder && handleDelete(confirmOrder)}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onDelete={() => setConfirmOrder(order)}
            deleting={deletingId === order.id}
          />
        ))}
      </div>
    </>
  );
}
