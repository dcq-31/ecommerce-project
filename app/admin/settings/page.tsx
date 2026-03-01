import { SettingsForm } from "components/admin/settings-form";
import { getSettings } from "lib/admin/settings-actions";

export const metadata = { title: "Configuración — Admin" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Configuración</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Ajustes generales de la tienda.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
