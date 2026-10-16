import { db } from "@/db";
import { categories, products, reviews } from "@/db/schema";
import { seedCategories, seedProducts } from "@/db/seed-data";
import { count } from "drizzle-orm";

const globalForSeed = globalThis as typeof globalThis & {
  __familyShoppersSeedPromise?: Promise<void>;
};

function daysAgo(days: number, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset);
  return d;
}

async function runSeed() {
  const [{ value: existing }] = await db.select({ value: count() }).from(categories);
  if (Number(existing) > 0) return;

  await db.transaction(async (tx) => {
    const insertedCategories = await tx
      .insert(categories)
      .values(seedCategories)
      .onConflictDoNothing()
      .returning();

    const categoryBySlug = new Map(insertedCategories.map((c) => [c.slug, c.id]));

    for (const p of seedProducts) {
      const categoryId = categoryBySlug.get(p.category);
      if (!categoryId) continue;

      const [product] = await tx
        .insert(products)
        .values({
          name: p.name,
          slug: p.slug,
          categoryId,
          subcategory: p.subcategory,
          shortDescription: p.shortDescription,
          description: p.description,
          details: p.details,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          images: p.images,
          colors: p.colors,
          sizes: p.sizes,
          tags: p.tags,
          stock: p.stock,
          featured: p.featured ?? false,
          isNew: p.isNew ?? false,
          createdAt: daysAgo(p.daysAgo),
        })
        .onConflictDoNothing()
        .returning();

      if (!product || p.reviews.length === 0) continue;

      await tx.insert(reviews).values(
        p.reviews.map((r, i) => ({
          productId: product.id,
          author: r.author,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: r.verified ?? true,
          createdAt: daysAgo(r.daysAgo, i),
        })),
      );
    }
  });
}

/**
 * Ensures demo data exists. Safe to call on every request — it short-circuits
 * once the catalog is populated and dedupes concurrent calls.
 */
export async function ensureSeeded() {
  if (!globalForSeed.__familyShoppersSeedPromise) {
    globalForSeed.__familyShoppersSeedPromise = runSeed().catch((err) => {
      globalForSeed.__familyShoppersSeedPromise = undefined;
      throw err;
    });
  }
  return globalForSeed.__familyShoppersSeedPromise;
}
