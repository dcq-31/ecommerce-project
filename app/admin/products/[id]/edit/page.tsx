import { ProductForm } from "components/admin/product-form";
import { getCategories, getProductById } from "lib/products";
import { notFound } from "next/navigation";

export const metadata = { title: "Editar producto — Admin" };

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) return notFound();

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">Editar producto</h2>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}