import { getCurrencyById } from "lib/products";
import { CurrencyForm } from "components/admin/currency-form";
import { notFound } from "next/navigation";

export const metadata = { title: "Editar moneda — Admin" };

export default async function EditCurrencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currency = await getCurrencyById(id);

  if (!currency) notFound();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Editar moneda</h2>
      <div className="max-w-lg">
        <CurrencyForm currency={currency} />
      </div>
    </div>
  );
}
