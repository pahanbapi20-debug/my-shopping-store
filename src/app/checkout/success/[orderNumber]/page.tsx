import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, MapPin, Package, Truck } from "lucide-react";
import { getOrderByNumber } from "@/lib/data";
import { formatPrice, SHIPPING_METHODS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function SuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const data = await getOrderByNumber(orderNumber);
  if (!data) notFound();
  const { order, items } = data;
  const method = SHIPPING_METHODS.find((m) => m.id === order.shippingMethod);

  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + (order.shippingMethod === "overnight" ? 1 : order.shippingMethod === "express" ? 3 : 6));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center animate-fade-up">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 animate-pop">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">Order {order.orderNumber}</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">Thank you, {order.firstName}!</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-600">
          Your order is confirmed. We&apos;ve sent a receipt to <strong className="text-ink-900">{order.email}</strong> and
          we&apos;ll email you again the moment it ships.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3 animate-fade-up delay-2">
        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <Truck className="h-5 w-5 text-terra-600" />
          <p className="mt-3 text-xs uppercase tracking-wide text-ink-500">Estimated delivery</p>
          <p className="mt-1 font-medium">
            {eta.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <p className="text-xs text-ink-500">{method?.label} · {method?.eta}</p>
        </div>
        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <MapPin className="h-5 w-5 text-terra-600" />
          <p className="mt-3 text-xs uppercase tracking-wide text-ink-500">Shipping to</p>
          <p className="mt-1 font-medium">
            {order.firstName} {order.lastName}
          </p>
          <p className="text-xs text-ink-500">
            {order.address1}
            {order.address2 && `, ${order.address2}`}
            <br />
            {order.city}, {order.state} {order.postalCode}
          </p>
        </div>
        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <Mail className="h-5 w-5 text-terra-600" />
          <p className="mt-3 text-xs uppercase tracking-wide text-ink-500">Payment</p>
          <p className="mt-1 font-medium">Card ending in {order.paymentLast4 || "••••"}</p>
          <p className="text-xs text-ink-500">Charged {formatPrice(order.total)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-cream-300 bg-white p-6 animate-fade-up delay-3">
        <h2 className="flex items-center gap-2 font-serif text-2xl">
          <Package className="h-5 w-5 text-terra-600" /> Your items
        </h2>
        <ul className="mt-5 divide-y divide-cream-300">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-4 py-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1">
                <Link href={`/products/${i.slug}`} className="text-sm font-medium hover:text-terra-600">
                  {i.name}
                </Link>
                <p className="text-xs text-ink-500">
                  {i.color}
                  {i.size && ` · Size ${i.size}`} · Qty {i.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-cream-300 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-600">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Discount</dt>
              <dd className="tabular-nums">−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-600">Shipping</dt>
            <dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-600">Tax</dt>
            <dd className="tabular-nums">{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-cream-300 pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up delay-4">
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
        <Link href="/" className="btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
