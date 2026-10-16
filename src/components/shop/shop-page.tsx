import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Suspense } from "react";
import { getCategories, getFilterOptions, searchProducts, type SortKey } from "@/lib/data";
import type { Category } from "@/db/schema";
import { ProductCard } from "@/components/product/product-card";
import { ActiveChips, FilterPanel, MobileFilters, SortSelect } from "@/components/shop/filters";
import { cn } from "@/lib/utils";

export type SearchParams = Record<string, string | string[] | undefined>;

const arr = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function ShopPage({ category, searchParams }: { category?: Category | null; searchParams: SearchParams }) {
  const sort = (one(searchParams.sort) as SortKey | undefined) ?? "featured";
  const page = Number(one(searchParams.page) ?? "1") || 1;
  const min = one(searchParams.min);
  const max = one(searchParams.max);
  const q = one(searchParams.q);

  const [result, options, allCategories] = await Promise.all([
    searchProducts({
      category: category?.slug,
      subcategory: arr(searchParams.sub),
      size: arr(searchParams.size),
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
      q,
      sale: one(searchParams.sale) === "1",
      sort,
      page,
      perPage: 12,
    }),
    getFilterOptions(category?.slug),
    getCategories(),
  ]);

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v === undefined) continue;
      for (const item of arr(v)) params.append(k, item);
    }
    if (p > 1) params.set("page", String(p));
    const base = category ? `/shop/${category.slug}` : "/shop";
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const title = q ? `Results for “${q}”` : category ? category.name : one(searchParams.sale) === "1" ? "Sale" : "All Products";

  return (
    <div>
      {/* Banner */}
      <section className="relative overflow-hidden border-b border-cream-300 bg-cream-100">
        {category && (
          <>
            <Image src={category.imageUrl} alt="" fill sizes="100vw" className="object-cover object-[50%_25%] opacity-20" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-100/80 to-cream-100/30" />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <nav className="text-xs text-ink-500">
            <Link href="/" className="hover:text-ink-900">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-ink-900">Shop</Link>
            {category && (
              <>
                <span className="mx-2">/</span>
                <span className="text-ink-900">{category.name}</span>
              </>
            )}
          </nav>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl tracking-tight animate-fade-up">{title}</h1>
          <p className="mt-4 max-w-xl text-ink-600 animate-fade-up delay-1">
            {category?.description ?? "Every style we carry for men, women and kids — filter by fit, price and size to find yours."}
          </p>

          <div className="mt-8 flex flex-wrap gap-2 animate-fade-up delay-2">
            <Link
              href="/shop"
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                !category ? "border-ink-900 bg-ink-900 text-cream-50" : "border-cream-300 bg-white hover:border-ink-900",
              )}
            >
              All
            </Link>
            {allCategories.map((c) => (
              <Link
                key={c.id}
                href={`/shop/${c.slug}`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  category?.slug === c.slug ? "border-ink-900 bg-ink-900 text-cream-50" : "border-cream-300 bg-white hover:border-ink-900",
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Suspense>
                <FilterPanel options={options} />
              </Suspense>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Suspense>
                  <MobileFilters options={options} />
                </Suspense>
                <p className="text-sm text-ink-600">
                  <strong className="text-ink-900">{result.total}</strong> {result.total === 1 ? "style" : "styles"}
                </p>
              </div>
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>
            <div className="mt-4">
              <Suspense>
                <ActiveChips />
              </Suspense>
            </div>

            {result.items.length === 0 ? (
              <div className="mt-16 flex flex-col items-center text-center animate-fade-up">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-200">
                  <SearchX className="h-8 w-8 text-ink-500" />
                </div>
                <h2 className="mt-6 font-serif text-3xl">Nothing matched</h2>
                <p className="mt-2 max-w-sm text-ink-600">
                  Try removing a filter or searching for something a little broader.
                </p>
                <Link href={category ? `/shop/${category.slug}` : "/shop"} className="btn-outline mt-6">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
                {result.items.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} priority={i < 3} />
                ))}
              </div>
            )}

            {result.totalPages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
                <Link
                  href={buildPageHref(Math.max(1, result.page - 1))}
                  aria-disabled={result.page === 1}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border border-cream-300 bg-white transition hover:border-ink-900",
                    result.page === 1 && "pointer-events-none opacity-40",
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                {Array.from({ length: result.totalPages }).map((_, i) => (
                  <Link
                    key={i}
                    href={buildPageHref(i + 1)}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full border text-sm font-medium transition",
                      result.page === i + 1 ? "border-ink-900 bg-ink-900 text-cream-50" : "border-cream-300 bg-white hover:border-ink-900",
                    )}
                  >
                    {i + 1}
                  </Link>
                ))}
                <Link
                  href={buildPageHref(Math.min(result.totalPages, result.page + 1))}
                  aria-disabled={result.page === result.totalPages}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border border-cream-300 bg-white transition hover:border-ink-900",
                    result.page === result.totalPages && "pointer-events-none opacity-40",
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
