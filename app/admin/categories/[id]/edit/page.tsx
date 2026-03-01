import { CategoryForm } from "components/admin/category-form";
import { getCategories } from "lib/products";
import { notFound } from "next/navigation";

export const metadata = { title: "Editar categoría — Admin" };

export default async function EditCategoryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const categories = await getCategories();
  const category = categories.find((c) => c.id === id);

  if (!category) return notFound();

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">Editar categoría</h2>
      <CategoryForm category={category} />
    </div>
  );
}