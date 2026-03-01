import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Banner, Category, Currency, Product, ProductImage } from "./types";

function getClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

// ─── Row → Domain mapping ────────────────────────────────────────────────────

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  price: string | number;
  currency_code: string;
  available_for_sale: boolean;
  featured_image_url: string | null;
  category: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  title: string;
};

type CurrencyRow = {
  id: string;
  name: string;
  rate: number;
  is_base: boolean;
  image_url: string | null;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function imageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

function toProductImage(url: string, altText = ""): ProductImage {
  return { url: imageUrl(url), altText, width: 0, height: 0 };
}

function rowToProduct(row: ProductRow): Product {
  const featuredImage = row.featured_image_url
    ? toProductImage(row.featured_image_url, row.title)
    : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: {
      amount: String(row.price),
      currencyCode: row.currency_code ?? "USD",
    },
    availableForSale: row.available_for_sale ?? true,
    featuredImage,
    images: featuredImage ? [featuredImage] : [],
    category: row.category,
    categoryId: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
  };
}

function rowToCurrency(row: CurrencyRow): Currency {
  return {
    id: row.id,
    name: row.name,
    rate: Number(row.rate),
    isBase: row.is_base,
    imageUrl: row.image_url ?? undefined,
  };
}

// ─── Public queries ──────────────────────────────────────────────────────────

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = getClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("available_for_sale", true)
    .single();

  return data ? rowToProduct(data as ProductRow) : null;
}

export async function getProducts({
  query,
  category,
  sort,
}: {
  query?: string;
  category?: string;
  sort?: string;
} = {}): Promise<Product[]> {
  const supabase = getClient();
  let q = supabase.from("products").select("*").eq("available_for_sale", true);

  if (query) {
    q = q.ilike("title", `%${query}%`);
  }
  if (category) {
    q = q.eq("category", category);
  }

  // Sorting
  if (sort === "price-asc") {
    q = q.order("price", { ascending: true });
  } else if (sort === "price-desc") {
    q = q.order("price", { ascending: false });
  } else if (sort === "title-asc") {
    q = q.order("title", { ascending: true });
  } else {
    q = q.order("created_at", { ascending: false });
  }

  const { data } = await q;
  return (data ?? []).map((r) => rowToProduct(r as ProductRow));
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = getClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("available_for_sale", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => rowToProduct(r as ProductRow));
}

/** Returns all categories from the categories table, ordered by title. */
export async function getCategories(): Promise<Category[]> {
  const supabase = getClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, title")
    .order("title", { ascending: true });

  return (data ?? []).map((r) => rowToCategory(r as CategoryRow));
}

/** Returns all currencies ordered: base first, then alphabetically by code. */
export async function getCurrencies(): Promise<Currency[]> {
  const supabase = getClient();
  const { data } = await supabase
    .from("currencies")
    .select("id, name, rate, is_base, image_url")
    .order("is_base", { ascending: false })
    .order("name", { ascending: true });

  return (data ?? []).map((r) => rowToCurrency(r as CurrencyRow));
}

export async function getCurrencyById(id: string): Promise<Currency | null> {
  const supabase = getClient();
  const { data } = await supabase
    .from("currencies")
    .select("id, name, rate, is_base, image_url")
    .eq("id", id)
    .single();

  return data ? rowToCurrency(data as CurrencyRow) : null;
}

// ─── Admin queries (auth required in calling server action) ──────────────────

export async function getAllProducts(): Promise<Product[]> {
  const supabase = getClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => rowToProduct(r as ProductRow));
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return data ? rowToProduct(data as ProductRow) : null;
}

export async function getBanners(): Promise<Banner[]> {
  const supabase = getClient();
  const { data } = await supabase
    .from("banners")
    .select("id, image_url, position, created_at, updated_at")
    .order("position");

  return (data ?? []).map((r) => ({
    id: r.id as string,
    imageUrl: r.image_url as string,
    position: r.position as number,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }));
}