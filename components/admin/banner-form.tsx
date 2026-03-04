"use client";

import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createBanner, updateBanner } from "lib/admin/banner-actions";
import type { Banner } from "lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function BannerForm({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Image state
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setNewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setNewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (newFile) formData.set("image", newFile);

    const result = banner
      ? await updateBanner(banner.id, formData)
      : await createBanner(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success(banner ? "Anuncio actualizado correctamente." : "Anuncio creado correctamente.");
      router.push("/admin/banners");
      router.refresh();
    }
  }

  const fieldClass =
    "w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-neutral-500 dark:bg-neutral-900";
  const labelClass =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";

  // Determine which image to show as preview
  const currentImageUrl = previewUrl ?? banner?.imageUrl ?? null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Position ──────────────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Posición</label>
        <input
          name="position"
          type="number"
          min={0}
          defaultValue={banner?.position ?? 0}
          className={fieldClass}
          placeholder="0"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Los anuncios se muestran en orden ascendente (0 primero).
        </p>
      </div>

      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          Imagen {banner ? "(opcional — deja vacío para mantener la actual)" : "*"}
        </label>

        {/* Image preview */}
        {currentImageUrl ? (
          <div className="relative mb-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="relative h-40 w-full">
              <Image
                src={currentImageUrl}
                alt="Vista previa"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 512px, 100vw"
                unoptimized={!!previewUrl}
              />
            </div>
            {/* Only allow clearing newly selected files */}
            {previewUrl && (
              <button
                type="button"
                onClick={clearImage}
                aria-label="Quitar imagen seleccionada"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <div className="border-t border-neutral-100 bg-white px-4 py-2 text-xs text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900">
              {previewUrl ? newFile?.name : "Imagen actual"}
            </div>
          </div>
        ) : null}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-400 px-4 py-5 text-sm text-neutral-500 transition hover:border-primary hover:text-primary dark:border-neutral-500 dark:hover:border-primary dark:hover:text-primary"
        >
          <PhotoIcon className="h-5 w-5" />
          {currentImageUrl ? "Cambiar imagen" : "Seleccionar imagen"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <p className="mt-1.5 text-xs text-neutral-400">
          Relación de aspecto recomendada: 4:1 (ej. 1920 × 480 px). Formatos: JPG, PNG, WebP.
        </p>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/20">
          {error}
        </p>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading
            ? "Guardando…"
            : banner
              ? "Actualizar anuncio"
              : "Crear anuncio"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/banners")}
          className="rounded-full border border-neutral-400 px-6 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
