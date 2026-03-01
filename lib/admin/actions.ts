"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "product-images";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publicImageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function requireAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return supabase;
}

export async function createProduct(
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await requireAuth();

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "El título es obligatorio." };

    const slug = slugify(title) || Date.now().toString();

    // Resolve category title from the selected category_id
    const categoryId = String(formData.get("category_id") ?? "").trim() || null;
    let categoryTitle: string | null = null;
    if (categoryId) {
      const { data: cat } = await supabase
        .from("categories")
        .select("title")
        .eq("id", categoryId)
        .single();
      categoryTitle = (cat as { title: string } | null)?.title ?? null;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        slug,
        title,
        price: parseFloat(String(formData.get("price") ?? "0")),
        currency_code: "USD",
        available_for_sale: formData.get("available_for_sale") === "on",
        category_id: categoryId,
        category: categoryTitle,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    const productId = data.id as string;

    // Upload images
    const images = formData.getAll("images") as File[];
    let featuredImageUrl: string | null = null;
    for (const file of images) {
      if (file.size === 0) continue;
      const ext = file.name.split(".").pop();
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file);
      if (!uploadError && !featuredImageUrl) {
        featuredImageUrl = publicImageUrl(path);
      }
    }

    if (featuredImageUrl) {
      await supabase
        .from("products")
        .update({ featured_image_url: featuredImageUrl })
        .eq("id", productId);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { id: productId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    // Fetch existing slug for cache revalidation (slug is immutable after creation)
    const { data: existing } = await supabase
      .from("products")
      .select("slug")
      .eq("id", id)
      .single();

    // Resolve category title from the selected category_id
    const categoryId = String(formData.get("category_id") ?? "").trim() || null;
    let categoryTitle: string | null = null;
    if (categoryId) {
      const { data: cat } = await supabase
        .from("categories")
        .select("title")
        .eq("id", categoryId)
        .single();
      categoryTitle = (cat as { title: string } | null)?.title ?? null;
    }

    const { error } = await supabase
      .from("products")
      .update({
        title: String(formData.get("title") ?? "").trim(),
        price: parseFloat(String(formData.get("price") ?? "0")),
        available_for_sale: formData.get("available_for_sale") === "on",
        category_id: categoryId,
        category: categoryTitle,
      })
      .eq("id", id);

    if (error) return { error: error.message };

    // Upload new images
    const images = formData.getAll("images") as File[];
    let featuredImageUrl: string | null = null;
    for (const file of images) {
      if (file.size === 0) continue;
      const ext = file.name.split(".").pop();
      const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file);
      if (!uploadError && !featuredImageUrl) {
        featuredImageUrl = publicImageUrl(path);
      }
    }

    if (featuredImageUrl) {
      await supabase
        .from("products")
        .update({ featured_image_url: featuredImageUrl })
        .eq("id", id);
    }

    revalidatePath("/admin/products");
    const slug = (existing as { slug: string } | null)?.slug;
    if (slug) revalidatePath(`/product/${slug}`);
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();

    // Delete storage objects for this product
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(id);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${id}/${f.name}`);
      await supabase.storage.from(BUCKET).remove(paths);
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/products");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteProductImage(
  productId: string,
  path: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) return { error: error.message };

    // If it was the featured image, clear it
    const publicUrl = publicImageUrl(path);
    await supabase
      .from("products")
      .update({ featured_image_url: null })
      .eq("id", productId)
      .eq("featured_image_url", publicUrl);

    revalidatePath("/admin/products");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function toggleProductAvailability(
  id: string,
  available: boolean,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase
      .from("products")
      .update({ available_for_sale: available })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/products");
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
