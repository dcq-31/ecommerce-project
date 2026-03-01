import { OrderTable } from "components/admin/order-table";
import { listOrders } from "lib/admin/order-actions";

export const metadata = { title: "Pedidos — Admin" };

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalUsd, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          {orders.length > 0 && (
            <p className="mt-1 text-sm text-neutral-500">
              {orders.length} pedido{orders.length !== 1 ? "s" : ""} en total
            </p>
          )}
        </div>
        {orders.length > 0 && (
          <div className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-right shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-xs text-neutral-400">Total acumulado (USD)</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              $ {totalRevenue.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      <OrderTable orders={orders} />
    </div>
  );
}
