import { BannerForm } from "components/admin/banner-form";

export const metadata = { title: "Nuevo anuncio — Admin" };

export default function NewBannerPage() {
  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">Nuevo anuncio</h2>
      <BannerForm />
    </div>
  );
}
