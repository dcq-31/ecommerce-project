"use client";

import { createCurrency, updateCurrency } from "lib/admin/currency-actions";
import type { Currency } from "lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function CurrencyForm({ currency }: { currency?: Currency }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currency?.imageUrl ?? null,
  );
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = currency
      ? await updateCurrency(currency.id, formData)
      : await createCurrency(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success(currency ? "Moneda actualizada correctamente." : "Moneda creada correctamente.");
      router.push("/admin/currencies");
      router.refresh();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  }

  function handleRemoveImage() {
    setPreviewUrl(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const fieldClass =
    "w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-neutral-500 dark:bg-neutral-900";
  const labelClass =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";
  const readonlyClass =
    "w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-600 cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Hidden field to signal image removal */}
      <input type="hidden" name="remove_image" value={removeImage ? "1" : "0"} />

      {/* Abbreviation */}
      <div>
        <label className={labelClass}>Abreviatura *</label>
        <input
          name="name"
          type="text"
          required
          maxLength={5}
          defaultValue={currency?.name}
          className={fieldClass}
          placeholder="ej. MLC"
          style={{ textTransform: "uppercase" }}
        />
      </div>

      {/* Rate */}
      <div>
        <label className={labelClass}>Tipo de cambio (relativo al USD) *</label>
        {currency?.isBase ? (
          <>
            <p className={readonlyClass}>1</p>
            <p className="mt-1 text-xs text-neutral-400">
              La moneda base siempre tiene tipo de cambio 1.
            </p>
          </>
        ) : (
          <input
            name="rate"
            type="number"
            required
            min="0.000001"
            step="any"
            defaultValue={currency?.rate}
            className={fieldClass}
            placeholder="ej. 510"
          />
        )}
      </div>

      {/* Image */}
      <div>
        <label className={labelClass}>Imagen / bandera (opcional)</label>

        {previewUrl && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800">
              <Image
                src={previewUrl}
                alt="Vista previa"
                fill
                className="object-contain p-1"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-xs text-destructive hover:underline"
            >
              Eliminar imagen
            </button>
          </div>
        )}

        <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-400 bg-neutral-50 px-4 py-6 text-sm text-neutral-500 transition hover:bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:bg-neutral-800">
          <span>
            {previewUrl ? "Reemplazar imagen" : "Haz clic para subir una imagen"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
        <p className="mt-1 text-xs text-neutral-400">
          PNG, JPG o SVG recomendados. Se mostrará como ícono en el selector de
          moneda.
        </p>
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
            : currency
              ? "Actualizar moneda"
              : "Crear moneda"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/currencies")}
          className="rounded-full border border-neutral-400 px-6 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
