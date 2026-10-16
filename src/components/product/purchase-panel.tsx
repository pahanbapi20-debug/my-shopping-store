"use client";

import { Check, Heart, Minus, Plus, RefreshCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";
import type { ProductWithMeta } from "@/lib/data";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { toast } from "@/components/ui/toaster";

export function PurchasePanel({ product }: { product: ProductWithMeta }) {
  const addItem = useCart((s) => s.addItem);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [wish, setWish] = useState(false);

  const needsSize = product.sizes.length > 0;

  const add = () => {
    if (needsSize && !size) {
      setError("Please select a size");
      return;
    }
    setError(null);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      size,
      color,
      quantity: qty,
      maxStock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="space-y-7">
      {product.colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Color: <span className="text-ink-600 font-normal">{color}</span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                title={c.name}
                aria-label={c.name}
                className={cn(
                  "relative h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-cream-50 transition",
                  color === c.name ? "ring-ink-900" : "ring-transparent hover:ring-cream-300",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {color === c.name && (
                  <Check
                    className="absolute inset-0 m-auto h-4 w-4 drop-shadow"
                    style={{ color: isLight(c.hex) ? "#1f1b16" : "#fff" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {needsSize && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Size{size && <span className="text-ink-600 font-normal">: {size}</span>}
            </span>
            <button className="text-xs text-ink-500 underline-offset-2 hover:underline">Size guide</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s);
                  setError(null);
                }}
                className={cn(
                  "min-w-12 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition",
                  size === s
                    ? "border-ink-900 bg-ink-900 text-cream-50"
                    : "border-cream-300 bg-white text-ink-800 hover:border-ink-900",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-terra-600 animate-fade-in">{error}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-cream-300 bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-12 w-11 place-items-center rounded-full hover:bg-cream-200"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="grid h-12 w-11 place-items-center rounded-full hover:bg-cream-200"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button onClick={add} className={cn("btn-primary flex-1 !py-3.5 min-w-[200px]", added && "!bg-terra-600")}>
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to bag
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to bag · {formatPrice(product.price * qty)}
            </>
          )}
        </button>
        <button
          onClick={() => {
            setWish((w) => !w);
            toast(wish ? "Removed from wishlist" : "Saved to wishlist", "info");
          }}
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full border transition",
            wish ? "border-terra-600 bg-terra-100 text-terra-600" : "border-cream-300 bg-white text-ink-700 hover:border-ink-900",
          )}
          aria-label="Save to wishlist"
        >
          <Heart className={cn("h-5 w-5", wish && "fill-current")} />
        </button>
      </div>

      <p className="text-sm text-ink-600">
        {product.stock > 20 ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock — ships within 24 hours
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-terra-600">
            <span className="h-2 w-2 rounded-full bg-terra-600" /> Low stock — only {product.stock} left
          </span>
        )}
      </p>

      <ul className="grid gap-3 rounded-2xl border border-cream-300 bg-cream-100 p-4 text-sm text-ink-700 sm:grid-cols-3">
        <li className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 text-terra-600" /> Free shipping over $75
        </li>
        <li className="flex items-center gap-2.5">
          <RefreshCcw className="h-4 w-4 text-terra-600" /> 30-day returns
        </li>
        <li className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-terra-600" /> 1-year guarantee
        </li>
      </ul>
    </div>
  );
}

function isLight(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}
