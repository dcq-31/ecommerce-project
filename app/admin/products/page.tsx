import { getAllProducts } from "lib/products";
import Link from "next/link";
import { ProductGrid } from "components/admin/product-grid";

export const metadata = { title: "Productos — Admin" };

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Productos</h2>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo producto
        </Link>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
