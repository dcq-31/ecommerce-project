"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return supabase;
}

export type Settings = {
  phone_number: string;
};

/** Fetch all settings as a typed object. Safe to call from server components. */
export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value;

  return {
    phone_number: map["phone_number"] ?? "",
  };
}

/** Persist all editable settings. Requires authentication. */
export async function updateSettings(
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    const phoneNumber = String(formData.get("phone_number") ?? "").trim();

    const { error } = await supabase.from("settings").upsert(
      [{ key: "phone_number", value: phoneNumber, updated_at: new Date().toISOString() }],
      { onConflict: "key" },
    );

    if (error) return { error: error.message };

    revalidatePath("/admin/settings");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
