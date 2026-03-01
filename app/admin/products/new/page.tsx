import { ProductForm } from "components/admin/product-form";
import { getCategories } from "lib/products";

export const metadata = { title: "Nuevo producto — Admin" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Nuevo producto</h2>
      <ProductForm categories={categories} />
    </div>
  );
}