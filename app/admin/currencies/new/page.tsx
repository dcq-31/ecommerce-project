import { CurrencyForm } from "components/admin/currency-form";

export const metadata = { title: "Nueva moneda — Admin" };

export default function NewCurrencyPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Nueva moneda</h2>
      <div className="max-w-lg">
        <CurrencyForm />
      </div>
    </div>
  );
}
