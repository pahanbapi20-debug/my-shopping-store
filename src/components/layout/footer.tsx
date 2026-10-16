import Link from "next/link";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-cream-300 bg-cream-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="font-serif text-2xl text-ink-900">
              Family <span className="italic text-terra-600">Shoppers</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-600 max-w-sm">
              Good clothes shouldn&apos;t cost a fortune. We make well-considered pieces for men, women and kids —
              and price them for real families.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
              <li><Link href="/shop/men" className="hover:text-terra-600">Men</Link></li>
              <li><Link href="/shop/women" className="hover:text-terra-600">Women</Link></li>
              <li><Link href="/shop/kids" className="hover:text-terra-600">Kids</Link></li>
              <li><Link href="/shop?sort=newest" className="hover:text-terra-600">New Arrivals</Link></li>
              <li><Link href="/shop?sale=1" className="hover:text-terra-600">Sale</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Help</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
              <li><span className="cursor-default">Shipping &amp; Delivery</span></li>
              <li><span className="cursor-default">Returns &amp; Exchanges</span></li>
              <li><span className="cursor-default">Size Guide</span></li>
              <li><span className="cursor-default">Contact Us</span></li>
              <li><span className="cursor-default">FAQ</span></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Visit</h4>
            <p className="mt-4 text-sm leading-relaxed text-ink-700">
              124 Maple Street<br />
              Springfield, IL 62701<br />
              Mon–Sat 9am–8pm · Sun 11am–6pm
            </p>
            <p className="mt-4 text-sm text-ink-700">
              (217) 555-0142<br />
              hello@familyshoppers.com
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream-300 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Family Shoppers. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
