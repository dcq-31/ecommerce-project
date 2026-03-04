// ─── Types ─────────────────────────────────────────────────────────────────────

export type OrderItem = {
  id: string;   // productId
  slug: string;
  t: string;    // title  (short key to keep URL compact)
  bp: string;   // base price in USD (short key)
  qty: number;
};

export type OrderData = {
  id: string;   // "ORD-XXXXX"
  ts: number;   // Unix timestamp (ms)
  cur: string;  // selected currency name e.g. "MLC"
  rate: number; // exchange rate vs USD at checkout time
  items: OrderItem[];
};

/** Order as stored in the database. */
export type StoredOrder = {
  id: string;
  data: OrderData;
  totalUsd: number;
  createdAt: string;
};

// ─── Encode / Decode ───────────────────────────────────────────────────────────

/**
 * Encodes an order to a URL-safe base64 string.
 * Works in both browser (Next.js ships Buffer polyfill) and Node.js.
 */
export function encodeOrder(order: OrderData): string {
  return Buffer.from(JSON.stringify(order))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** Decodes the URL parameter back to OrderData, or returns null on error. */
export function decodeOrder(encoded: string): OrderData | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString();
    return JSON.parse(json) as OrderData;
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generates a short human-readable order ID. */
export function generateOrderId(): string {
  return "ORD-" + Date.now().toString(36).toUpperCase().slice(-6);
}

/** Formats a number as currency without Intl.NumberFormat locale issues. */
export function fmtMoney(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

/** Builds a wa.me deep-link that pre-fills the WhatsApp message. */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Builds the formatted WhatsApp order message. */
export function buildWhatsAppMessage(order: OrderData): string {
  const date = new Date(order.ts).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const total =
    order.items.reduce((sum, i) => sum + parseFloat(i.bp) * i.qty, 0) *
    order.rate;

  // Plain-ASCII product lines — no emojis or fancy Unicode so every character
  // is cleanly URL-encoded by encodeURIComponent in buildWhatsAppUrl.
  const itemLines = order.items
    .map((item) => {
      const lineTotal = parseFloat(item.bp) * order.rate * item.qty;
      const qty = item.qty > 1 ? ` x${item.qty}` : "";
      return `${item.t}${qty} - $${fmtMoney(lineTotal)} ${order.cur}`;
    })
    .join("\n");

  const lines = [
    `*Nuevo pedido ${order.id}*`,
    date,
    ``,
    `*Productos*`,
    itemLines,
    ``,
    `*Total: $${fmtMoney(total)} ${order.cur}*`,
  ];

  return lines.join("\n");
}
