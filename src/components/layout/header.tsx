"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { selectCount, useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop/men", label: "Men" },
  { href: "/shop/women", label: "Women" },
  { href: "/shop/kids", label: "Kids" },
  { href: "/shop?sale=1", label: "Sale", accent: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const count = useCart(selectCount);
  const hydrated = useCart((s) => s.hydrated);
  const openCart = useCart((s) => s.openCart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!hydrated || count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [count, hydrated]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    setSearchOpen(false);
  };

  const isCheckout = pathname?.startsWith("/checkout");

  return (
    <>
      <div className="bg-ink-900 text-cream-100 text-[11px] sm:text-xs tracking-wide">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-6">
          <span className="hidden sm:inline">Free standard shipping on orders over $75</span>
          <span className="hidden sm:inline text-ink-500">•</span>
          <span>Use code <strong className="font-semibold text-gold-400">FAMILY10</strong> for 10% off</span>
          <span className="hidden md:inline text-ink-500">•</span>
          <span className="hidden md:inline">30-day easy returns</span>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300 backdrop-blur-md",
          scrolled ? "bg-cream-50/90 border-cream-300/70 shadow-[0_1px_0_rgba(0,0,0,0.02),0_8px_30px_-16px_rgba(22,19,15,0.25)]" : "bg-cream-50 border-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-[72px] items-center justify-between gap-4">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMenuOpen(true)}
                className="rounded-full p-2 hover:bg-cream-200 transition"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-cream-50 font-serif text-lg leading-none transition group-hover:bg-terra-600">
                F
              </span>
              <span className="font-serif text-xl md:text-2xl tracking-tight text-ink-900">
                Family <span className="italic text-terra-600">Shoppers</span>
              </span>
            </Link>

            {!isCheckout && (
              <nav className="hidden lg:flex items-center gap-8">
                {NAV.map((n) => {
                  const active =
                    n.href === "/shop" ? pathname === "/shop" : pathname?.startsWith(n.href.split("?")[0]) && n.href !== "/shop?sale=1";
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "link-underline text-sm font-medium tracking-wide transition-colors",
                        n.accent ? "text-terra-600 hover:text-terra-700" : active ? "text-ink-900" : "text-ink-600 hover:text-ink-900",
                      )}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center gap-1 sm:gap-2">
              {!isCheckout && (
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  className="rounded-full p-2 hover:bg-cream-200 transition"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={openCart}
                className="relative rounded-full p-2 hover:bg-cream-200 transition"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {hydrated && count > 0 && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-terra-600 px-1 text-[10px] font-semibold text-white transition-transform",
                      bump && "scale-125",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-cream-300/70 bg-cream-50 animate-fade-in">
            <form onSubmit={onSearch} className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
              <Search className="h-5 w-5 text-ink-500" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dresses, jackets, sneakers…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-400"
              />
              <button type="submit" className="btn-primary !py-2 !px-4 text-xs">
                Search
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="p-1">
                <X className="h-5 w-5 text-ink-500" />
              </button>
            </form>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 animate-fade-in" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-cream-50 shadow-2xl flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-5 h-16 border-b border-cream-300">
              <span className="font-serif text-xl">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-cream-200" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col p-5 gap-1">
              {NAV.map((n, i) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-lg px-3 py-3 font-serif text-2xl animate-fade-up",
                    n.accent ? "text-terra-600" : "text-ink-900",
                    `delay-${i + 1}`,
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-5 text-xs text-ink-500 border-t border-cream-300">
              Free shipping over $75 · 30-day returns
            </div>
          </div>
        </div>
      )}
    </>
  );
}
