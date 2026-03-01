import { CategoryTable } from "components/admin/category-table";
import { getAllProducts, getCategories } from "lib/products";
import Link from "next/link";

export const metadata = { title: "Categorías — Admin" };

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllProducts(),
  ]);

  const productCounts: Record<string, number> = {};
  for (const product of products) {
    if (product.category) {
      productCounts[product.category] = (productCounts[product.category] ?? 0) + 1;
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categorías</h2>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nueva categoría
        </Link>
      </div>
      <CategoryTable categories={categories} productCounts={productCounts} />
    </div>
  );
}