"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { ProductWithMeta } from "@/lib/data";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import { Stars } from "@/components/ui/stars";
import { useCart } from "@/store/cart";
import { toast } from "@/components/ui/toaster";

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: {
  product: ProductWithMeta;
  index?: number;
  priority?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const pct = discountPercent(product.price, product.compareAtPrice);
  const secondImage = product.images[1];

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      size: product.sizes[Math.floor(product.sizes.length / 2)] ?? "",
      color: product.colors[0]?.name ?? "",
      maxStock: product.stock,
    });
    toast(`Added ${product.name} to your bag`);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn("group block animate-fade-up", `delay-${Math.min((index % 4) + 1, 6)}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-200">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-all duration-700 ease-out",
            hover && secondImage ? "opacity-0 scale-105" : "opacity-100 group-hover:scale-105",
          )}
        />
        {secondImage && (
          <Image
            src={secondImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              hover ? "opacity-100 scale-105" : "opacity-0 scale-100",
            )}
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {pct > 0 && (
            <span className="rounded-full bg-terra-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              −{pct}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-cream-50/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-900 backdrop-blur">
              New
            </span>
          )}
          {product.stock <= 20 && (
            <span className="rounded-full bg-ink-900/85 px-2.5 py-1 text-[11px] font-medium text-cream-50 backdrop-blur">
              Only {product.stock} left
            </span>
          )}
        </div>

        <button
          onClick={quickAdd}
          className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-cream-50 text-ink-900 opacity-0 shadow-lg transition-all duration-300 hover:bg-ink-900 hover:text-cream-50 group-hover:translate-y-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Quick add ${product.name}`}
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3.5 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-medium leading-snug text-ink-900 group-hover:text-terra-600 transition-colors">
            {product.name}
          </h3>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-semibold tabular-nums">{formatPrice(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xs text-ink-400 line-through tabular-nums">{formatPrice(product.compareAtPrice)}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-ink-500">
          {product.categoryName} · {product.subcategory}
        </p>
        <div className="flex items-center gap-2">
          <Stars rating={product.avgRating} size="xs" />
          <span className="text-xs text-ink-500">
            {product.reviewCount > 0 ? `${product.avgRating.toFixed(1)} (${product.reviewCount})` : "No reviews yet"}
          </span>
        </div>
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1 pt-0.5">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
