import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getReviewsForProduct } from "@/lib/data";
import { Gallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { Reviews } from "@/components/product/reviews";
import { ProductCard } from "@/components/product/product-card";
import { Stars } from "@/components/ui/stars";
import { discountPercent, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([getReviewsForProduct(product.id), getRelatedProducts(product, 4)]);
  const pct = discountPercent(product.price, product.compareAtPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <nav className="text-xs text-ink-500 animate-fade-in">
        <Link href="/" className="hover:text-ink-900">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-ink-900">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop/${product.categorySlug}`} className="hover:text-ink-900">{product.categoryName}</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-up">
          <Gallery images={product.images} name={product.name} badge={pct > 0 ? `Save ${pct}%` : product.isNew ? "New" : null} />
        </div>

        <div className="animate-fade-up delay-2 lg:pt-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">
            {product.categoryName} · {product.subcategory}
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-[1.05] tracking-tight">{product.name}</h1>

          <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900">
            <Stars rating={product.avgRating} size="sm" />
            <span>
              {product.reviewCount > 0
                ? `${product.avgRating.toFixed(1)} · ${product.reviewCount} review${product.reviewCount === 1 ? "" : "s"}`
                : "Be the first to review"}
            </span>
          </a>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-ink-400 line-through tabular-nums">{formatPrice(product.compareAtPrice)}</span>
                <span className="rounded-full bg-terra-100 px-2.5 py-1 text-xs font-semibold text-terra-700">
                  Save {formatPrice(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-500">
            or 4 interest-free payments of {formatPrice(Math.round(product.price / 4))}
          </p>

          <p className="mt-6 text-base leading-relaxed text-ink-700">{product.shortDescription}</p>

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>

          <div className="mt-10 space-y-6 border-t border-cream-300 pt-8">
            <div>
              <h3 className="font-serif text-xl">About this piece</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{product.description}</p>
            </div>
            {product.details.length > 0 && (
              <div>
                <h3 className="font-serif text-xl">Details &amp; care</h3>
                <ul className="mt-2 grid gap-1.5 text-sm text-ink-700 sm:grid-cols-2">
                  {product.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terra-600" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/shop?q=${encodeURIComponent(t)}`}
                    className="rounded-full border border-cream-300 bg-white px-3 py-1 text-xs text-ink-600 hover:border-ink-900 hover:text-ink-900"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-cream-300 pt-16">
        <Reviews productId={product.id} reviews={reviews} avgRating={product.avgRating} />
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">Complete the look</p>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl tracking-tight">You may also like</h2>
            </div>
            <Link href={`/shop/${product.categorySlug}`} className="hidden sm:inline text-sm font-medium link-underline">
              More {product.categoryName}
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
