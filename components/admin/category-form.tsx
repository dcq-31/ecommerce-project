"use client";

import { createCategory, updateCategory } from "lib/admin/category-actions";
import type { Category } from "lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = category
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success(category ? "Categoría actualizada correctamente." : "Categoría creada correctamente.");
      router.push("/admin/categories");
      router.refresh();
    }
  }

  const fieldClass =
    "w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-neutral-500 dark:bg-neutral-900";
  const labelClass =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className={labelClass}>Nombre *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={category?.title}
          className={fieldClass}
          placeholder="ej. Líquidos"
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/20">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading
            ? "Guardando…"
            : category
              ? "Actualizar categoría"
              : "Crear categoría"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="rounded-full border border-neutral-400 px-6 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
