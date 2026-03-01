"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "currency-images";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function publicImageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function requireAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return supabase;
}

async function deleteStorageImage(
  supabase: Awaited<ReturnType<typeof requireAuth>>,
  imageUrl: string,
) {
  const marker = `${BUCKET}/`;
  const path = imageUrl.includes(marker)
    ? imageUrl.slice(imageUrl.indexOf(marker) + marker.length)
    : null;
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }
}

export async function createCurrency(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await requireAuth();

    const name = String(formData.get("name") ?? "").trim();
    const rate = parseFloat(String(formData.get("rate") ?? "0"));

    if (!name) return { error: "La abreviatura es obligatoria." };
    if (name.length > 5)
      return { error: "La abreviatura no puede tener más de 5 caracteres." };
    if (isNaN(rate) || rate <= 0)
      return { error: "El tipo de cambio debe ser un número positivo." };

    let imageUrl: string | null = null;
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) return { error: uploadError.message };
      imageUrl = publicImageUrl(path);
    }

    const { data, error } = await supabase
      .from("currencies")
      .insert({ name, rate, is_base: false, image_url: imageUrl })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/admin/currencies");
    revalidatePath("/");
    return { id: (data as { id: string }).id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateCurrency(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    const name = String(formData.get("name") ?? "").trim();

    if (!name) return { error: "La abreviatura es obligatoria." };
    if (name.length > 5)
      return { error: "La abreviatura no puede tener más de 5 caracteres." };

    // Fetch existing row to check is_base before validating rate
    const { data: existing } = await supabase
      .from("currencies")
      .select("is_base, image_url")
      .eq("id", id)
      .single();
    const isBase = (existing as { is_base: boolean; image_url: string | null } | null)
      ?.is_base ?? false;

    const updates: Record<string, unknown> = {
      name,
      updated_at: new Date().toISOString(),
    };

    if (!isBase) {
      const rate = parseFloat(String(formData.get("rate") ?? "0"));
      if (isNaN(rate) || rate <= 0)
        return { error: "El tipo de cambio debe ser un número positivo." };
      updates.rate = rate;
    }

    const removeImage = formData.get("remove_image") === "1";
    const file = formData.get("image") as File | null;
    const hasNewFile = file && file.size > 0;

    const existingImageUrl = (existing as { is_base: boolean; image_url: string | null } | null)
      ?.image_url;

    if (removeImage && !hasNewFile) {
      // Explicitly remove image
      if (existingImageUrl) {
        await deleteStorageImage(supabase, existingImageUrl);
      }
      updates.image_url = null;
    } else if (hasNewFile) {
      // Replace with new image
      if (existingImageUrl) {
        await deleteStorageImage(supabase, existingImageUrl);
      }
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) return { error: uploadError.message };
      updates.image_url = publicImageUrl(path);
    }

    const { error } = await supabase
      .from("currencies")
      .update(updates)
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/currencies");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteCurrency(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    const { data: currency } = await supabase
      .from("currencies")
      .select("is_base, image_url")
      .eq("id", id)
      .single();

    if (currency?.is_base) {
      return { error: "No se puede eliminar la moneda base." };
    }

    const imageUrl = (
      currency as { is_base: boolean; image_url: string | null } | null
    )?.image_url;
    if (imageUrl) {
      await deleteStorageImage(supabase, imageUrl);
    }

    const { error } = await supabase.from("currencies").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/currencies");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
