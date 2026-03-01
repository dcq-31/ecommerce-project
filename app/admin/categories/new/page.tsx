import { CategoryForm } from "components/admin/category-form";

export const metadata = { title: "Nueva categoría — Admin" };

export default function NewCategoryPage() {
  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">Nueva categoría</h2>
      <CategoryForm />
    </div>
  );
}