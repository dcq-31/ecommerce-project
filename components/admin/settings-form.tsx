"use client";

import { updateSettings, type Settings } from "lib/admin/settings-actions";
import { useState } from "react";
import { toast } from "sonner";

const fieldClass =
  "w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-neutral-500 dark:bg-neutral-900";
const labelClass =
  "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await updateSettings(new FormData(e.currentTarget));
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Configuración guardada correctamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className={labelClass}>Número de teléfono</label>
        <input
          type="tel"
          name="phone_number"
          defaultValue={settings.phone_number}
          placeholder="+53 5 000 0000"
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-neutral-400">
          Incluye el código de país, p.&nbsp;ej. +53 5 123 4567
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
          {loading ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
