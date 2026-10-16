import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-28 text-center animate-fade-up">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">404</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">We couldn&apos;t find that.</h1>
      <p className="mt-4 text-ink-600">The page may have moved, or the item may have sold out. Let&apos;s get you back to shopping.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/shop" className="btn-primary">
          Browse the shop
        </Link>
        <Link href="/" className="btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
