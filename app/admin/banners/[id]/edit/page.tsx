import { BannerForm } from "components/admin/banner-form";
import { getBanners } from "lib/products";
import { notFound } from "next/navigation";

export const metadata = { title: "Editar anuncio — Admin" };

export default async function EditBannerPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const banners = await getBanners();
  const banner = banners.find((b) => b.id === id);

  if (!banner) return notFound();

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">Editar anuncio</h2>
      <BannerForm banner={banner} />
    </div>
  );
}
