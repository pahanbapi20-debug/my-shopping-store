"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Lock, ShoppingBag, Tag } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { selectSubtotal, useCart } from "@/store/cart";
import {
  applyPromo,
  cn,
  computeTotals,
  formatPrice,
  FREE_SHIPPING_THRESHOLD,
  PROMO_CODES,
  SHIPPING_METHODS,
  type ShippingMethodId,
} from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

type Errors = Record<string, string>;

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; error?: string };

function FieldBase({ name, label, className, error, ...rest }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-ink-700">{label}</span>
      <input name={name} className="input" aria-invalid={error ? "true" : undefined} {...rest} />
      {error && <span className="mt-1 block text-xs text-terra-600">{error}</span>}
    </label>
  );
}

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);

  const [method, setMethod] = useState<ShippingMethodId>("standard");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");

  const discount = useMemo(() => applyPromo(promo ?? undefined, subtotal), [promo, subtotal]);
  const totals = useMemo(() => computeTotals(subtotal, method, discount), [subtotal, method, discount]);

  const applyCode = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromo(code);
      toast(`Applied ${code}: ${PROMO_CODES[code].label}`);
    } else {
      toast("That code isn't valid", "error");
    }
  };

  const validate = (fd: FormData): Errors => {
    const e: Errors = {};
    const need = (k: string, label: string) => {
      if (!String(fd.get(k) ?? "").trim()) e[k] = `${label} is required`;
    };
    need("email", "Email");
    need("firstName", "First name");
    need("lastName", "Last name");
    need("address1", "Address");
    need("city", "City");
    need("state", "State");
    need("postalCode", "ZIP code");
    const email = String(fd.get("email") ?? "");
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Enter a valid email";
    const zip = String(fd.get("postalCode") ?? "");
    if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) e.postalCode = "Enter a valid ZIP";
    if (card.replace(/\s/g, "").length !== 16) e.cardNumber = "Enter a 16-digit card number";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) e.expiry = "MM/YY";
    const cvc = String(fd.get("cvc") ?? "");
    if (!/^\d{3,4}$/.test(cvc)) e.cvc = "3–4 digits";
    need("cardName", "Name on card");
    return e;
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs = validate(fd);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
          customer: {
            email: fd.get("email"),
            firstName: fd.get("firstName"),
            lastName: fd.get("lastName"),
            phone: fd.get("phone"),
            address1: fd.get("address1"),
            address2: fd.get("address2"),
            city: fd.get("city"),
            state: fd.get("state"),
            postalCode: fd.get("postalCode"),
            country: "United States",
          },
          shippingMethod: method,
          promoCode: promo,
          payment: { cardNumber: card },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");
      clear();
      router.push(`/checkout/success/${data.orderNumber}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            <div className="skeleton h-10 w-1/3 rounded-lg" />
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center animate-fade-up">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream-200">
          <ShoppingBag className="h-8 w-8 text-ink-500" />
        </div>
        <h1 className="mt-6 font-serif text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-ink-600">Add a few favorites and come back — we&apos;ll be here.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl tracking-tight animate-fade-up">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-6">
          {/* Contact */}
          <section className="rounded-2xl border border-cream-300 bg-white p-6 animate-fade-up delay-1">
            <h2 className="flex items-center gap-3 font-serif text-2xl">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs text-cream-50 font-sans">1</span>
              Contact
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FieldBase name="email" error={errors.email} label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
              <FieldBase name="phone" error={errors.phone} label="Phone (optional)" type="tel" placeholder="(555) 555-0142" autoComplete="tel" />
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-2xl border border-cream-300 bg-white p-6 animate-fade-up delay-2">
            <h2 className="flex items-center gap-3 font-serif text-2xl">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs text-cream-50 font-sans">2</span>
              Shipping address
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FieldBase name="firstName" error={errors.firstName} label="First name" autoComplete="given-name" />
              <FieldBase name="lastName" error={errors.lastName} label="Last name" autoComplete="family-name" />
              <FieldBase name="address1" error={errors.address1} label="Address" className="sm:col-span-2" autoComplete="address-line1" placeholder="Street address" />
              <FieldBase name="address2" error={errors.address2} label="Apartment, suite, etc. (optional)" className="sm:col-span-2" autoComplete="address-line2" />
              <FieldBase name="city" error={errors.city} label="City" autoComplete="address-level2" />
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink-700">State</span>
                  <select name="state" className="input" defaultValue="" aria-invalid={errors.state ? "true" : undefined}>
                    <option value="" disabled>
                      —
                    </option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && <span className="mt-1 block text-xs text-terra-600">{errors.state}</span>}
                </label>
                <FieldBase name="postalCode" error={errors.postalCode} label="ZIP" inputMode="numeric" autoComplete="postal-code" placeholder="62701" />
              </div>
            </div>

            <h3 className="mt-8 text-sm font-medium">Delivery method</h3>
            <div className="mt-3 grid gap-3">
              {SHIPPING_METHODS.map((m) => {
                const free = m.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD;
                const active = method === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4 text-left transition",
                      active ? "border-ink-900 bg-cream-50 ring-1 ring-ink-900" : "border-cream-300 hover:border-ink-400",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-full border",
                          active ? "border-ink-900 bg-ink-900" : "border-cream-300",
                        )}
                      >
                        {active && <Check className="h-3 w-3 text-cream-50" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{m.label}</span>
                        <span className="block text-xs text-ink-500">{m.eta}</span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {free ? <span className="text-emerald-700">Free</span> : formatPrice(m.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-cream-300 bg-white p-6 animate-fade-up delay-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-3 font-serif text-2xl">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs text-cream-50 font-sans">3</span>
                Payment
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                <Lock className="h-3.5 w-3.5" /> Encrypted &amp; secure
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-500">
              Demo checkout — use any 16-digit number, e.g. <code className="rounded bg-cream-200 px-1">4242 4242 4242 4242</code>.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-ink-700">Card number</span>
                <div className="relative">
                  <input
                    name="cardNumber"
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    className="input pl-11"
                    aria-invalid={errors.cardNumber ? "true" : undefined}
                  />
                  <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400" />
                </div>
                {errors.cardNumber && <span className="mt-1 block text-xs text-terra-600">{errors.cardNumber}</span>}
              </label>
              <FieldBase name="cardName" error={errors.cardName} label="Name on card" autoComplete="cc-name" className="sm:col-span-2" />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-700">Expiry</span>
                <input
                  name="expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  className="input"
                  aria-invalid={errors.expiry ? "true" : undefined}
                />
                {errors.expiry && <span className="mt-1 block text-xs text-terra-600">{errors.expiry}</span>}
              </label>
              <FieldBase name="cvc" error={errors.cvc} label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} />
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 rounded-2xl border border-cream-300 bg-white p-6 animate-fade-up delay-2">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <ul className="mt-5 max-h-80 space-y-4 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                  <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" />
                  <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-ink-900 px-1 text-[10px] font-semibold text-cream-50">
                    {i.quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{i.name}</p>
                  <p className="text-xs text-ink-500">
                    {i.color}
                    {i.size && ` · ${i.size}`}
                  </p>
                  <p className="mt-auto text-sm font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-cream-300 pt-5">
            {promo ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <span className="inline-flex items-center gap-2">
                  <Tag className="h-4 w-4" /> {promo} applied
                </span>
                <button type="button" onClick={() => setPromo(null)} className="text-xs underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code"
                  className="input !py-2.5 uppercase"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCode();
                    }
                  }}
                />
                <button type="button" onClick={applyCode} className="btn-outline !py-2 !px-4 text-xs shrink-0">
                  Apply
                </button>
              </div>
            )}
            <p className="mt-2 text-[11px] text-ink-400">Try FAMILY10 or WELCOME15</p>
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-cream-300 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-600">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-600">Shipping ({totals.method.label})</dt>
              <dd className="tabular-nums">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-600">Estimated tax</dt>
              <dd className="tabular-nums">{formatPrice(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-cream-300 pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full !py-4">
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50/40 border-t-cream-50" />
                Placing order…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Place order · {formatPrice(totals.total)}
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-ink-400">
            By placing your order you agree to our Terms &amp; Privacy Policy.
          </p>
        </aside>
      </div>
    </form>
  );
}
