"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { cn, formatPrice } from "@/lib/utils";
import type { SortKey } from "@/lib/data";

type Options = {
  subcategories: { name: string; count: number }[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
};

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "name", label: "Name A–Z" },
];

const PRICE_BANDS = [
  { label: "Under $40", min: 0, max: 3999 },
  { label: "$40 – $70", min: 4000, max: 6999 },
  { label: "$70 – $100", min: 7000, max: 9999 },
  { label: "$100+", min: 10000, max: 100000 },
];

export function useShopParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page");
      startTransition(() => {
        router.push(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  const toggleMulti = (key: string, value: string) =>
    update((p) => {
      const values = p.getAll(key);
      p.delete(key);
      const set = new Set(values);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      for (const v of set) p.append(key, v);
    });

  return { params, update, toggleMulti, pending };
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-cream-300 py-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-ink-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-4 animate-fade-in">{children}</div>}
    </div>
  );
}

export function FilterPanel({ options }: { options: Options }) {
  const { params, update, toggleMulti } = useShopParams();
  const activeSubs = params.getAll("sub");
  const activeSizes = params.getAll("size");
  const min = params.get("min");
  const max = params.get("max");
  const sale = params.get("sale") === "1";

  const activeCount = activeSubs.length + activeSizes.length + (min || max ? 1 : 0) + (sale ? 1 : 0);

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-serif text-2xl">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={() =>
              update((p) => {
                p.delete("sub");
                p.delete("size");
                p.delete("min");
                p.delete("max");
                p.delete("sale");
              })
            }
            className="text-xs text-terra-600 hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <FilterSection title="Category">
        <ul className="space-y-2.5">
          {options.subcategories.map((s) => (
            <li key={s.name}>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-700 hover:text-ink-900">
                <input
                  type="checkbox"
                  checked={activeSubs.includes(s.name)}
                  onChange={() => toggleMulti("sub", s.name)}
                  className="h-4 w-4 rounded border-cream-300 accent-ink-900"
                />
                <span className="flex-1">{s.name}</span>
                <span className="text-xs text-ink-400">{s.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Price">
        <ul className="space-y-2.5">
          {PRICE_BANDS.map((b) => {
            const active = min === String(b.min) && max === String(b.max);
            return (
              <li key={b.label}>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-700 hover:text-ink-900">
                  <input
                    type="radio"
                    name="price"
                    checked={active}
                    onChange={() =>
                      update((p) => {
                        if (active) {
                          p.delete("min");
                          p.delete("max");
                        } else {
                          p.set("min", String(b.min));
                          p.set("max", String(b.max));
                        }
                      })
                    }
                    onClick={() => {
                      if (active)
                        update((p) => {
                          p.delete("min");
                          p.delete("max");
                        });
                    }}
                    className="h-4 w-4 accent-ink-900"
                  />
                  {b.label}
                </label>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-ink-400">
          Range in store: {formatPrice(options.minPrice, { compact: true })} – {formatPrice(options.maxPrice, { compact: true })}
        </p>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((s) => {
            const active = activeSizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleMulti("size", s)}
                className={cn(
                  "min-w-10 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  active ? "border-ink-900 bg-ink-900 text-cream-50" : "border-cream-300 bg-white text-ink-700 hover:border-ink-900",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Offers">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={sale}
            onChange={() => update((p) => (sale ? p.delete("sale") : p.set("sale", "1")))}
            className="h-4 w-4 accent-ink-900"
          />
          On sale only
        </label>
      </FilterSection>
    </div>
  );
}

export function SortSelect() {
  const { params, update, pending } = useShopParams();
  const value = (params.get("sort") as SortKey) || "featured";
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline text-ink-500">Sort by</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => update((p) => (e.target.value === "featured" ? p.delete("sort") : p.set("sort", e.target.value)))}
          className={cn(
            "appearance-none rounded-full border border-cream-300 bg-white py-2 pl-4 pr-9 text-sm font-medium outline-none focus:border-ink-900",
            pending && "opacity-60",
          )}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      </div>
    </label>
  );
}

export function ActiveChips() {
  const { params, update, toggleMulti } = useShopParams();
  const chips: { label: string; onRemove: () => void }[] = [];
  const q = params.get("q");
  if (q) chips.push({ label: `“${q}”`, onRemove: () => update((p) => p.delete("q")) });
  for (const s of params.getAll("sub")) chips.push({ label: s, onRemove: () => toggleMulti("sub", s) });
  for (const s of params.getAll("size")) chips.push({ label: `Size ${s}`, onRemove: () => toggleMulti("size", s) });
  const min = params.get("min");
  const max = params.get("max");
  if (min || max) {
    const band = PRICE_BANDS.find((b) => String(b.min) === min && String(b.max) === max);
    chips.push({
      label: band?.label ?? "Price",
      onRemove: () =>
        update((p) => {
          p.delete("min");
          p.delete("max");
        }),
    });
  }
  if (params.get("sale") === "1") chips.push({ label: "On sale", onRemove: () => update((p) => p.delete("sale")) });

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={c.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-medium text-cream-50 hover:bg-terra-600 transition"
        >
          {c.label} <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}

export function MobileFilters({ options }: { options: Options }) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();

  useEffect(() => {
    setOpen(false);
  }, [params]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filters
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream-50 p-6 animate-fade-up">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-cream-300" />
            <FilterPanel options={options} />
            <button onClick={() => setOpen(false)} className="btn-primary mt-6 w-full">
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
