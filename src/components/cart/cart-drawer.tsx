"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { selectCount, selectSubtotal, useCart } from "@/store/cart";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px] animate-fade-in" onClick={closeCart} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream-50 shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
          <h2 className="font-serif text-2xl">
            Your Bag{" "}
            {count > 0 && <span className="text-base text-ink-500 font-sans">({count})</span>}
          </h2>
          <button onClick={closeCart} className="rounded-full p-2 hover:bg-cream-200" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length > 0 && (
          <div className="px-5 pt-4">
            <p className="text-xs text-ink-600">
              {remaining > 0 ? (
                <>
                  You&apos;re <strong className="text-ink-900">{formatPrice(remaining)}</strong> away from free shipping
                </>
              ) : (
                <span className="font-medium text-terra-600">🎉 You&apos;ve unlocked free standard shipping</span>
              )}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-terra-500 to-gold-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center animate-fade-up">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-200">
                <ShoppingBag className="h-8 w-8 text-ink-500" />
              </div>
              <h3 className="mt-6 font-serif text-2xl">Your bag is empty</h3>
              <p className="mt-2 max-w-xs text-sm text-ink-600">
                Looks like you haven&apos;t added anything yet. Let&apos;s fix that.
              </p>
              <button onClick={closeCart} className="btn-primary mt-6">
                Start shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-cream-300">
              {items.map((item, i) => (
                <li key={item.key} className={`flex gap-4 py-4 animate-fade-up delay-${Math.min(i + 1, 6)}`}>
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-cream-200"
                    style={{ width: 88 }}
                  >
                    <Image src={item.image} alt={item.name} fill sizes="88px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-ink-900 hover:text-terra-600 line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {item.color}
                          {item.size && ` · Size ${item.size}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="rounded-full p-1.5 text-ink-400 hover:bg-cream-200 hover:text-terra-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-cream-300 bg-white">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream-200 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                        {item.compareAtPrice && (
                          <p className="text-xs text-ink-400 line-through tabular-nums">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cream-300 bg-white px-5 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">Shipping, taxes and promo codes calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart} className="btn-primary mt-4 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={closeCart} className="mt-3 w-full text-center text-sm text-ink-600 hover:text-ink-900 link-underline">
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
