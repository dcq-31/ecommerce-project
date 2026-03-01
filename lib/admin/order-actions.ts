"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrderData, StoredOrder } from "lib/order";

// ─── Public client (anon key) — for customer-facing writes ───────────────────

function getPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

// ─── Auth guard — for admin-only reads/deletes ────────────────────────────────

async function requireAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
  return supabase;
}

// ─── Row → domain ─────────────────────────────────────────────────────────────

function rowToStoredOrder(row: {
  id: string;
  data: OrderData;
  total_usd: number;
  created_at: string;
}): StoredOrder {
  return {
    id: row.id,
    data: row.data,
    totalUsd: row.total_usd,
    createdAt: row.created_at,
  };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Creates an order. Called from the cart modal (no auth required). */
export async function createOrder(
  order: OrderData,
): Promise<{ error?: string }> {
  try {
    const supabase = getPublicClient();
    const totalUsd = order.items.reduce(
      (sum, i) => sum + parseFloat(i.bp) * i.qty,
      0,
    );
    const { error } = await supabase
      .from("orders")
      .insert({ id: order.id, data: order, total_usd: totalUsd });

    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/** Returns all orders sorted newest first. Admin only. */
export async function listOrders(): Promise<StoredOrder[]> {
  const supabase = await requireAuth();
  const { data, error } = await supabase
    .from("orders")
    .select("id, data, total_usd, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToStoredOrder(r as Parameters<typeof rowToStoredOrder>[0]));
}

/** Returns a single order by ID. Admin only. Returns null if not found. */
export async function getOrderById(id: string): Promise<StoredOrder | null> {
  const supabase = await requireAuth();
  const { data } = await supabase
    .from("orders")
    .select("id, data, total_usd, created_at")
    .eq("id", id)
    .single();

  return data ? rowToStoredOrder(data as Parameters<typeof rowToStoredOrder>[0]) : null;
}

/** Deletes a single order by ID. Admin only. */
export async function deleteOrder(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/orders");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
