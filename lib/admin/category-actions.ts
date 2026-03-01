"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return supabase;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategory(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await requireAuth();

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "El nombre de la categoría es obligatorio." };

    const slug = slugify(title);

    const { data, error } = await supabase
      .from("categories")
      .insert({ title, slug })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { id: (data as { id: string }).id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "El nombre de la categoría es obligatorio." };

    const { error } = await supabase
      .from("categories")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    // Keep the text column in products in sync with the new title
    await supabase
      .from("products")
      .update({ category: title })
      .eq("category_id", id);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteCategory(
  id: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    // Detach products before deleting so the text column is also cleared
    await supabase
      .from("products")
      .update({ category: null, category_id: null })
      .eq("category_id", id);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}