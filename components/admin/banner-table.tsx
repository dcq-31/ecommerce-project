"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmDialog } from "components/admin/confirm-dialog";
import { deleteBanner } from "lib/admin/banner-actions";
import type { Banner } from "lib/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ─── Banner card ──────────────────────────────────────────────────────────────

function BannerCard({
  banner,
  onDelete,
  deleting,
}: {
  banner: Banner;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow transition-all duration-300 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900">

      {/* ── Image thumbnail ──────────────────────────────────────────────────── */}
      <div className="relative h-32 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {banner.imageUrl ? (
          <Image
            src={banner.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Position badge */}
        <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          #{banner.position}
        </span>
      </div>

      {/* ── Info + actions ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-1.5 px-3 py-3">
        <Link
          href={`/admin/banners/${banner.id}/edit`}
          aria-label="Editar anuncio"
          className="inline-flex items-center rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-primary hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-primary dark:hover:text-white"
        >
          <PencilSquareIcon className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          aria-label="Eliminar anuncio"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center rounded-lg bg-neutral-100 p-1.5 text-neutral-700 transition-colors hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-destructive dark:hover:text-white"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


// ─── Grid ──────────────────────────────────────────────────────────────────────

export function BannerTable({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmBanner, setConfirmBanner] = useState<Banner | null>(null);

  async function handleDelete(banner: Banner) {
    setDeletingId(banner.id);
    const result = await deleteBanner(banner.id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Anuncio eliminado.");
      router.refresh();
    }
  }

  if (banners.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-lg font-medium">Aún no hay anuncios.</p>
        <Link
          href="/admin/banners/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Crea tu primer anuncio →
        </Link>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmBanner !== null}
        title="Eliminar anuncio"
        message="¿Eliminar este anuncio? Esta acción no se puede deshacer."
        onClose={() => setConfirmBanner(null)}
        onConfirm={() => confirmBanner && handleDelete(confirmBanner)}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {banners.map((banner) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            onDelete={() => setConfirmBanner(banner)}
            deleting={deletingId === banner.id}
          />
        ))}
      </div>
    </>
  );
}
