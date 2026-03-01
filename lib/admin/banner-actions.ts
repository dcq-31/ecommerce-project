"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "banner-images";
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

export async function createBanner(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await requireAuth();

    const position = parseInt(String(formData.get("position") ?? "0"), 10);

    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { error: "La imagen es obligatoria." };

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });
    if (uploadError) return { error: uploadError.message };

    const imageUrl = publicImageUrl(path);

    const { data, error } = await supabase
      .from("banners")
      .insert({ image_url: imageUrl, position })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { id: (data as { id: string }).id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateBanner(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    const position = parseInt(String(formData.get("position") ?? "0"), 10);

    const updates: Record<string, unknown> = {
      position,
      updated_at: new Date().toISOString(),
    };

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      // Delete old image first
      const { data: existing } = await supabase
        .from("banners")
        .select("image_url")
        .eq("id", id)
        .single();

      if (existing) {
        const oldUrl = (existing as { image_url: string }).image_url;
        const marker = `${BUCKET}/`;
        const oldPath = oldUrl.includes(marker)
          ? oldUrl.slice(oldUrl.indexOf(marker) + marker.length)
          : null;
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) return { error: uploadError.message };

      updates.image_url = publicImageUrl(path);
    }

    const { error } = await supabase
      .from("banners")
      .update(updates)
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteBanner(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    const { data: existing } = await supabase
      .from("banners")
      .select("image_url")
      .eq("id", id)
      .single();

    if (existing) {
      const url = (existing as { image_url: string }).image_url;
      const marker = `${BUCKET}/`;
      const path = url.includes(marker)
        ? url.slice(url.indexOf(marker) + marker.length)
        : null;
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
    }

    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
