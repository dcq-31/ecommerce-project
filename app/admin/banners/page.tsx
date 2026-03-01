import { BannerTable } from "components/admin/banner-table";
import { getBanners } from "lib/products";
import Link from "next/link";

export const metadata = { title: "Anuncios — Admin" };

export default async function AdminBannersPage() {
  const banners = await getBanners();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Anuncios</h2>
        <Link
          href="/admin/banners/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nuevo anuncio
        </Link>
      </div>
      <BannerTable banners={banners} />
    </div>
  );
}
