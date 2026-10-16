export function formatPrice(cents: number, opts: { compact?: boolean } = {}) {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.compact && Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export const FREE_SHIPPING_THRESHOLD = 7500; // $75

export const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", eta: "4–7 business days", price: 595 },
  { id: "express", label: "Express", eta: "2–3 business days", price: 1295 },
  { id: "overnight", label: "Overnight", eta: "Next business day", price: 2495 },
] as const;

export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];

export const TAX_RATE = 0.0725;

export function computeTotals(subtotal: number, methodId: ShippingMethodId, discount = 0) {
  const method = SHIPPING_METHODS.find((m) => m.id === methodId) ?? SHIPPING_METHODS[0];
  const shipping = methodId === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : method.price;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE);
  const total = taxable + shipping + tax;
  return { shipping, tax, total, method };
}

export const PROMO_CODES: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
  FAMILY10: { type: "percent", value: 10, label: "10% off your order" },
  WELCOME15: { type: "percent", value: 15, label: "15% off — welcome to the family" },
  SAVE20: { type: "fixed", value: 2000, label: "$20 off" },
};

export function applyPromo(code: string | undefined, subtotal: number) {
  if (!code) return 0;
  const promo = PROMO_CODES[code.trim().toUpperCase()];
  if (!promo) return 0;
  if (promo.type === "percent") return Math.round((subtotal * promo.value) / 100);
  return Math.min(subtotal, promo.value);
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
