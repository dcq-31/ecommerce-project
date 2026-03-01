"use client";

import { ConfirmDialog } from "components/admin/confirm-dialog";
import { deleteProduct } from "lib/admin/actions";
import type { Product } from "lib/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmProduct, setConfirmProduct] = useState<Product | null>(null);

  async function handleDelete(product: Product) {
    setDeletingId(product.id);
    const result = await deleteProduct(product.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Producto eliminado.");
      router.refresh();
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-300 bg-white p-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-lg font-medium">Aún no hay productos.</p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Crea tu primer producto →
        </Link>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmProduct !== null}
        title="Eliminar producto"
        message={`¿Eliminar "${confirmProduct?.title}"? Esta acción no se puede deshacer.`}
        onClose={() => setConfirmProduct(null)}
        onConfirm={() => confirmProduct && handleDelete(confirmProduct)}
      />
      <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-300 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950">
            <tr>
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <div className="relative h-10 w-10 flex-none overflow-hidden rounded-md border border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {product.title}
                      </p>
                      <p className="text-xs text-neutral-400">/product/{product.slug}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {product.category ?? <span className="text-neutral-300">—</span>}
                </td>
                <td className="px-4 py-3 font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: product.price.currencyCode,
                  }).format(parseFloat(product.price.amount))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.availableForSale
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {product.availableForSale ? "Activo" : "Borrador"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-md px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setConfirmProduct(product)}
                      disabled={deletingId === product.id}
                      className="rounded-md px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 dark:hover:bg-destructive/20"
                    >
                      {deletingId === product.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
