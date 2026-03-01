import { getCurrencies } from "lib/products";
import Link from "next/link";
import { CurrencyTable } from "components/admin/currency-table";

export const metadata = { title: "Monedas — Admin" };

export default async function AdminCurrenciesPage() {
  const currencies = await getCurrencies();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monedas</h2>
        <Link
          href="/admin/currencies/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nueva moneda
        </Link>
      </div>
      <CurrencyTable currencies={currencies} />
    </div>
  );
}
