import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, RefreshCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getCategories, getFeaturedProducts, getNewArrivals, getStorefrontStats } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { Stars } from "@/components/ui/stars";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.pexels.com/photos/7943928/pexels-photo-7943928.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1100";
const HERO_SIDE =
  "https://images.pexels.com/photos/5705094/pexels-photo-5705094.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700";
const EDITORIAL =
  "https://images.pexels.com/photos/8484131/pexels-photo-8484131.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1000";

const TESTIMONIALS = [
  {
    name: "Rebecca H.",
    role: "Mom of three, Naperville",
    quote:
      "I finally found one store where I can dress all of us without three separate trips. The kids' stuff actually survives the washer.",
    rating: 5,
  },
  {
    name: "Daniel O.",
    role: "Teacher, Peoria",
    quote:
      "The oxford shirts are my work uniform now. Quality that feels like the expensive brands at a price I don't have to think about.",
    rating: 5,
  },
  {
    name: "Priya & Sam",
    role: "Newlyweds, Champaign",
    quote:
      "Ordered a dress and a trench for a wedding, both arrived in two days and fit perfectly. Returns were painless when we swapped a size.",
    rating: 5,
  },
];

export default async function HomePage() {
  const [categoriesList, featured, arrivals, stats] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getNewArrivals(4),
    getStorefrontStats(),
  ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-14 md:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6 relative z-10">
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink-700 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                Spring / Summer collection is here
              </p>
              <h1 className="animate-fade-up delay-1 mt-6 font-serif text-[clamp(2.6rem,6vw,5rem)] leading-[1.02] tracking-tight text-ink-900">
                Dressing the whole family,{" "}
                <em className="italic text-terra-600">without the markup.</em>
              </h1>
              <p className="animate-fade-up delay-2 mt-6 max-w-lg text-base md:text-lg leading-relaxed text-ink-600">
                Thoughtfully made clothes for men, women and kids — honest fabrics, flattering fits, and prices built
                for real households. Free shipping over $75.
              </p>
              <div className="animate-fade-up delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Link href="/shop" className="btn-primary">
                  Shop the collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/shop?sale=1" className="btn-outline">
                  View sale
                </Link>
              </div>
              <div className="animate-fade-up delay-4 mt-10 flex items-center gap-6 text-sm text-ink-600">
                <div className="flex items-center gap-2">
                  <Stars rating={stats.avgRating || 4.8} size="sm" />
                  <span>
                    <strong className="text-ink-900">{(stats.avgRating || 4.8).toFixed(1)}</strong> from{" "}
                    {stats.reviewCount.toLocaleString()}+ reviews
                  </span>
                </div>
                <span className="hidden sm:inline text-cream-300">|</span>
                <span className="hidden sm:inline">{stats.productCount} styles in stock</span>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 animate-fade-up delay-2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[0_30px_80px_-30px_rgba(22,19,15,0.45)]">
                    <Image src={HERO_IMAGE} alt="Mother and daughter shopping together" fill priority sizes="(max-width: 1024px) 60vw, 35vw" className="object-cover" />
                  </div>
                </div>
                <div className="col-span-2 flex flex-col gap-4 pt-12 animate-fade-up delay-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgba(22,19,15,0.4)]">
                    <Image src={HERO_SIDE} alt="Family with shopping bags" fill sizes="(max-width: 1024px) 40vw, 20vw" className="object-cover" />
                  </div>
                  <div className="rounded-[1.5rem] bg-ink-900 p-5 text-cream-50">
                    <p className="font-serif text-3xl leading-none">
                      30<span className="text-gold-400">%</span>
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-cream-300">off select outerwear &amp; occasion wear this week</p>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-terra-100 blur-3xl opacity-70" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-cream-300 bg-cream-100 py-3 overflow-hidden">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-xs font-medium uppercase tracking-[0.22em] text-ink-600">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12">
              {["Free shipping over $75", "30-day easy returns", "New arrivals weekly", "Family-owned since 1998", "Sizes 2T to XXL", "Secure checkout"].map((t) => (
                <span key={t} className="flex items-center gap-12">
                  {t} <span className="text-gold-500">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">Shop by</p>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl tracking-tight">Collections for everyone</h2>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium link-underline">
            All products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {categoriesList.map((c, i) => (
            <Link
              key={c.id}
              href={`/shop/${c.slug}`}
              className={`group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-[1.5rem] animate-fade-up delay-${i + 1}`}
            >
              <Image
                src={c.imageUrl}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-cream-50">
                <p className="text-xs uppercase tracking-[0.2em] text-cream-300">{c.tagline}</p>
                <h3 className="mt-2 font-serif text-4xl">{c.name}</h3>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  Shop {c.name} <ArrowRight className="h-4 w-4" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-cream-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">Curated</p>
              <h2 className="mt-2 font-serif text-4xl md:text-5xl tracking-tight">Featured favorites</h2>
              <p className="mt-3 max-w-md text-ink-600">The pieces our customers reorder, gift, and tell their friends about.</p>
            </div>
            <Link href="/shop?sort=rating" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium link-underline">
              Top rated <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
            <Image src={EDITORIAL} alt="Designer in studio with garments" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute bottom-6 left-6 rounded-2xl bg-cream-50/90 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Since 1998</p>
              <p className="mt-1 font-serif text-xl">Family-owned &amp; run</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">Our promise</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl leading-[1.05] tracking-tight">
              Good clothes shouldn&apos;t be a luxury.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              We started Family Shoppers with a simple idea: the same quality you&apos;d find at boutique prices, minus
              the boutique. We work directly with mills and cut out the middle, so a merino sweater costs what a
              merino sweater should.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                { icon: Truck, title: "Fast, free shipping", text: "Free standard shipping on every order over $75." },
                { icon: RefreshCcw, title: "30-day returns", text: "Didn't work out? Send it back, no questions asked." },
                { icon: ShieldCheck, title: "Quality guaranteed", text: "If a seam gives out in the first year, we'll replace it." },
                { icon: Sparkles, title: "New every week", text: "Fresh arrivals landing every Thursday." },
              ].map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-terra-100 text-terra-600">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-medium">{f.title}</p>
                    <p className="mt-0.5 text-sm text-ink-600">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/shop" className="btn-outline mt-10">
              Explore the shop
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra-600">Just landed</p>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl tracking-tight">New arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium link-underline">
            See all new <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {arrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ink-900 py-20 text-cream-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">From our customers</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">Loved by families like yours</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={t.name}
                className={`rounded-2xl border border-ink-700 bg-ink-800/60 p-7 animate-fade-up delay-${i + 1}`}
              >
                <Stars rating={t.rating} size="sm" />
                <blockquote className="mt-4 font-serif text-xl leading-relaxed text-cream-100">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-ink-400">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-16 grid gap-8 rounded-3xl border border-ink-700 bg-gradient-to-br from-ink-800 to-ink-900 p-8 md:grid-cols-2 md:items-center md:p-12">
            <div>
              <h3 className="font-serif text-3xl md:text-4xl">Join the family, get 15% off.</h3>
              <p className="mt-3 text-cream-300">
                First dibs on new arrivals, members-only sales, and a welcome code for your first order.
              </p>
            </div>
            <div className="md:max-w-md md:justify-self-end w-full">
              <NewsletterForm dark />
              <p className="mt-3 text-xs text-ink-500">No spam. Unsubscribe any time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
