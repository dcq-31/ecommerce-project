"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { ConfirmDialog } from "components/admin/confirm-dialog";
import { createProduct, deleteProductImage, updateProduct } from "lib/admin/actions";
import type { Category, Product } from "lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

function storagePathFromUrl(url: string): string {
  const marker = "/product-images/";
  const idx = url.indexOf(marker);
  return idx === -1 ? url : url.slice(idx + marker.length);
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    product?.categoryId
      ? (categories.find((c) => c.id === product.categoryId) ?? null)
      : null,
  );

  // Existing saved images (already in Supabase Storage)
  const [savedImageUrls, setSavedImageUrls] = useState<string[]>(
    product?.images.map((i) => i.url) ?? [],
  );
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);
  const [confirmImageUrl, setConfirmImageUrl] = useState<string | null>(null);

  // Newly selected files (pending upload on submit)
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviewUrls((prev) => [...prev, ...urls]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewFile(index: number) {
    URL.revokeObjectURL(newPreviewUrls[index]!);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeleteSavedImage(url: string) {
    if (!product) return;
    setDeletingImageUrl(url);
    const path = storagePathFromUrl(url);
    const result = await deleteProductImage(product.id, path);
    setDeletingImageUrl(null);
    if (result.error) {
      setError(result.error);
    } else {
      setSavedImageUrls((prev) => prev.filter((u) => u !== url));
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.delete("images");
    for (const file of newFiles) {
      formData.append("images", file);
    }

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success(product ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      router.push("/admin/products");
      router.refresh();
    }
  }

  const fieldClass =
    "w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-neutral-600 dark:bg-neutral-900";
  const labelClass =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";

  return (
    <>
      <ConfirmDialog
        open={confirmImageUrl !== null}
        title="Eliminar imagen"
        message="¿Eliminar esta imagen? Esta acción no se puede deshacer."
        onClose={() => setConfirmImageUrl(null)}
        onConfirm={() => confirmImageUrl && handleDeleteSavedImage(confirmImageUrl)}
      />
      <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className={labelClass}>Título *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={product?.title}
          className={fieldClass}
          placeholder="ej. Café molido 250 g"
        />
      </div>

      {/* Price */}
      <div>
        <label className={labelClass}>Precio *</label>
        <input
          name="price"
          type="number"
          required
          min="0"
          step="0.01"
          defaultValue={product ? parseFloat(product.price.amount) : ""}
          className={fieldClass}
          placeholder="ej. 250.00"
        />
      </div>

      {/* Category — Listbox dropdown */}
      <div>
        <label className={labelClass}>Categoría</label>
        <input type="hidden" name="category_id" value={selectedCategory?.id ?? ""} />
        <Listbox value={selectedCategory} onChange={setSelectedCategory}>
          <div className="relative">
            <ListboxButton
              className={clsx(fieldClass, "flex items-center justify-between text-left")}
            >
              <span className={selectedCategory ? "" : "text-neutral-400 dark:text-neutral-600"}>
                {selectedCategory?.title ?? "Sin categoría"}
              </span>
              <ChevronUpDownIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            </ListboxButton>

            <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-300 bg-white py-1 shadow-lg focus:outline-none dark:border-neutral-700 dark:bg-neutral-900">
              <ListboxOption
                value={null}
                className={({ focus }: { focus: boolean }) =>
                  clsx(
                    "flex cursor-default select-none items-center gap-2 px-3 py-2 text-sm",
                    focus
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-neutral-500 dark:text-neutral-400",
                  )
                }
              >
                {({ selected }: { selected: boolean }) => (
                  <>
                    <CheckIcon
                      className={clsx(
                        "h-4 w-4 flex-shrink-0",
                        selected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    Sin categoría
                  </>
                )}
              </ListboxOption>

              {categories.map((cat) => (
                <ListboxOption
                  key={cat.id}
                  value={cat}
                  className={({ focus }: { focus: boolean }) =>
                    clsx(
                      "flex cursor-default select-none items-center gap-2 px-3 py-2 text-sm",
                      focus
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-neutral-900 dark:text-neutral-100",
                    )
                  }
                >
                  {({ selected }: { selected: boolean }) => (
                    <>
                      <CheckIcon
                        className={clsx(
                          "h-4 w-4 flex-shrink-0",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {cat.title}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {/* Available for sale */}
      <div className="flex items-center gap-3">
        <input
          name="available_for_sale"
          type="checkbox"
          id="available_for_sale"
          defaultChecked={product?.availableForSale ?? true}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <label htmlFor="available_for_sale" className="text-sm font-medium">
          Disponible para la venta
        </label>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Imágenes</label>
        <input
          ref={fileInputRef}
          name="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-neutral-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
        />

        {(savedImageUrls.length > 0 || newPreviewUrls.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {savedImageUrls.map((url) => (
              <div
                key={url}
                className="group relative h-20 w-20 overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-600"
              >
                <Image
                  src={url}
                  alt="Imagen guardada"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={() => setConfirmImageUrl(url)}
                  disabled={deletingImageUrl === url}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100 disabled:cursor-not-allowed"
                  title="Eliminar imagen"
                >
                  {deletingImageUrl === url ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <span className="text-xl font-light leading-none">×</span>
                  )}
                </button>
              </div>
            ))}

            {newPreviewUrls.map((url, i) => (
              <div
                key={url}
                className="group relative h-20 w-20 overflow-hidden rounded-md border border-primary/40"
              >
                <Image
                  src={url}
                  alt={`Nueva imagen ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100"
                  title="Quitar imagen"
                >
                  <span className="text-xl font-light leading-none">×</span>
                </button>
                <span className="pointer-events-none absolute bottom-0 left-0 right-0 bg-primary/80 py-0.5 text-center text-[10px] text-white">
                  Nueva
                </span>
              </div>
            ))}
          </div>
        )}
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
            : product
              ? "Actualizar producto"
              : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-neutral-400 px-6 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
        >
          Cancelar
        </button>
      </div>
      </form>
    </>
  );
}
