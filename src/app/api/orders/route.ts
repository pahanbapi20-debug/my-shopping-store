import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { applyPromo, computeTotals, SHIPPING_METHODS, type ShippingMethodId } from "@/lib/utils";
import { inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type IncomingItem = { productId: number; quantity: number; size?: string; color?: string };

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `FS-${ts}${rand}`;
}

const required = (v: unknown) => typeof v === "string" && v.trim().length > 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) return NextResponse.json({ error: "Your bag is empty" }, { status: 400 });

    const customer = body.customer ?? {};
    for (const key of ["email", "firstName", "lastName", "address1", "city", "state", "postalCode"]) {
      if (!required(customer[key])) return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) {
      return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    }

    const methodId = SHIPPING_METHODS.some((m) => m.id === body.shippingMethod)
      ? (body.shippingMethod as ShippingMethodId)
      : "standard";

    const ids = [...new Set(items.map((i) => Number(i.productId)).filter(Number.isInteger))];
    const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(dbProducts.map((p) => [p.id, p]));

    const lines = items.map((i) => {
      const p = byId.get(Number(i.productId));
      if (!p) throw new Error("A product in your bag is no longer available");
      const quantity = Math.max(1, Math.min(Number(i.quantity) || 1, p.stock));
      return { product: p, quantity, size: String(i.size ?? ""), color: String(i.color ?? "") };
    });

    const subtotal = lines.reduce((n, l) => n + l.product.price * l.quantity, 0);
    const discount = applyPromo(body.promoCode, subtotal);
    const { shipping, tax, total } = computeTotals(subtotal, methodId, discount);

    const card = String(body.payment?.cardNumber ?? "").replace(/\D/g, "");
    const last4 = card.slice(-4);

    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          email: customer.email.trim(),
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          phone: String(customer.phone ?? "").trim(),
          address1: customer.address1.trim(),
          address2: String(customer.address2 ?? "").trim(),
          city: customer.city.trim(),
          state: customer.state.trim(),
          postalCode: customer.postalCode.trim(),
          country: String(customer.country ?? "United States"),
          shippingMethod: methodId,
          paymentLast4: last4,
          subtotal,
          shipping,
          tax,
          discount,
          total,
          status: "confirmed",
        })
        .returning();

      await tx.insert(orderItems).values(
        lines.map((l) => ({
          orderId: order.id,
          productId: l.product.id,
          name: l.product.name,
          slug: l.product.slug,
          image: l.product.images[0] ?? "",
          price: l.product.price,
          quantity: l.quantity,
          size: l.size,
          color: l.color,
        })),
      );

      for (const l of lines) {
        await tx
          .update(products)
          .set({ stock: sql`greatest(${products.stock} - ${l.quantity}, 0)` })
          .where(sql`${products.id} = ${l.product.id}`);
      }

      return order;
    });

    return NextResponse.json({ orderNumber: result.orderNumber, total: result.total }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
