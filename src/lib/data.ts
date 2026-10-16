import { db } from "@/db";
import { categories, orderItems, orders, products, reviews } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { and, asc, avg, count, desc, eq, gte, ilike, inArray, lte, or, sql, SQL } from "drizzle-orm";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "name";

export type ProductWithMeta = typeof products.$inferSelect & {
  categoryName: string;
  categorySlug: string;
  avgRating: number;
  reviewCount: number;
};

export type ShopFilters = {
  category?: string;
  subcategory?: string[];
  size?: string[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sale?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

const ratingSubquery = db
  .select({
    productId: reviews.productId,
    avgRating: avg(reviews.rating).as("avg_rating"),
    reviewCount: count(reviews.id).as("review_count"),
  })
  .from(reviews)
  .groupBy(reviews.productId)
  .as("ratings");

function baseProductQuery() {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      categoryId: products.categoryId,
      subcategory: products.subcategory,
      shortDescription: products.shortDescription,
      description: products.description,
      details: products.details,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      colors: products.colors,
      sizes: products.sizes,
      tags: products.tags,
      stock: products.stock,
      featured: products.featured,
      isNew: products.isNew,
      createdAt: products.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      avgRating: sql<number>`coalesce(${ratingSubquery.avgRating}, 0)::float`,
      reviewCount: sql<number>`coalesce(${ratingSubquery.reviewCount}, 0)::int`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(ratingSubquery, eq(ratingSubquery.productId, products.id));
}

function normalize(row: Awaited<ReturnType<ReturnType<typeof baseProductQuery>["execute"]>>[number]): ProductWithMeta {
  return {
    ...row,
    avgRating: Number(row.avgRating ?? 0),
    reviewCount: Number(row.reviewCount ?? 0),
  };
}

export async function getCategories() {
  await ensureSeeded();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  await ensureSeeded();
  const [cat] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return cat ?? null;
}

export async function getFeaturedProducts(limit = 8) {
  await ensureSeeded();
  const rows = await baseProductQuery()
    .where(eq(products.featured, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return rows.map(normalize);
}

export async function getNewArrivals(limit = 4) {
  await ensureSeeded();
  const rows = await baseProductQuery().orderBy(desc(products.createdAt)).limit(limit);
  return rows.map(normalize);
}

export async function getProductBySlug(slug: string) {
  await ensureSeeded();
  const rows = await baseProductQuery().where(eq(products.slug, slug)).limit(1);
  return rows[0] ? normalize(rows[0]) : null;
}

export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  await ensureSeeded();
  const rows = await baseProductQuery().where(inArray(products.id, ids));
  return rows.map(normalize);
}

export async function getRelatedProducts(product: ProductWithMeta, limit = 4) {
  const rows = await baseProductQuery()
    .where(and(eq(products.categoryId, product.categoryId), sql`${products.id} <> ${product.id}`))
    .orderBy(desc(products.featured), desc(products.createdAt))
    .limit(limit);
  return rows.map(normalize);
}

export async function getReviewsForProduct(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function getFilterOptions(categorySlug?: string) {
  await ensureSeeded();
  const where = categorySlug ? eq(categories.slug, categorySlug) : undefined;
  const rows = await db
    .select({
      subcategory: products.subcategory,
      sizes: products.sizes,
      price: products.price,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(where);

  const subcategories = new Map<string, number>();
  const sizes = new Set<string>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const r of rows) {
    subcategories.set(r.subcategory, (subcategories.get(r.subcategory) ?? 0) + 1);
    for (const s of r.sizes) sizes.add(s);
    min = Math.min(min, r.price);
    max = Math.max(max, r.price);
  }
  const sizeOrder = ["XS", "XS/S", "S", "M", "M/L", "L", "XL", "XL/XXL", "XXL"];
  const sortedSizes = [...sizes].sort((a, b) => {
    const ai = sizeOrder.indexOf(a);
    const bi = sizeOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    const an = parseFloat(a);
    const bn = parseFloat(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.localeCompare(b);
  });

  return {
    subcategories: [...subcategories.entries()]
      .map(([name, n]) => ({ name, count: n }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    sizes: sortedSizes,
    minPrice: Number.isFinite(min) ? min : 0,
    maxPrice: max,
  };
}

export async function searchProducts(filters: ShopFilters) {
  await ensureSeeded();
  const conditions: SQL[] = [];

  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.subcategory && filters.subcategory.length > 0) {
    conditions.push(inArray(products.subcategory, filters.subcategory));
  }
  if (filters.size && filters.size.length > 0) {
    conditions.push(sql`${products.sizes} ?| array[${sql.join(filters.size.map((s) => sql`${s}`), sql`, `)}]::text[]`);
  }
  if (filters.minPrice !== undefined) conditions.push(gte(products.price, filters.minPrice));
  if (filters.maxPrice !== undefined) conditions.push(lte(products.price, filters.maxPrice));
  if (filters.sale) conditions.push(sql`${products.compareAtPrice} is not null`);
  if (filters.q && filters.q.trim()) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.shortDescription, term),
        ilike(products.subcategory, term),
        ilike(categories.name, term),
        sql`${products.tags}::text ilike ${term}`,
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy = (() => {
    switch (filters.sort) {
      case "newest":
        return [desc(products.createdAt)];
      case "price-asc":
        return [asc(products.price)];
      case "price-desc":
        return [desc(products.price)];
      case "rating":
        return [desc(sql`coalesce(${ratingSubquery.avgRating}, 0)`), desc(sql`coalesce(${ratingSubquery.reviewCount}, 0)`)];
      case "name":
        return [asc(products.name)];
      case "featured":
      default:
        return [desc(products.featured), desc(sql`coalesce(${ratingSubquery.reviewCount}, 0)`), desc(products.createdAt)];
    }
  })();

  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  const [rows, [{ value: total }]] = await Promise.all([
    baseProductQuery()
      .where(where)
      .orderBy(...orderBy)
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ value: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  return {
    items: rows.map(normalize),
    total: Number(total),
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(Number(total) / perPage)),
  };
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function getStorefrontStats() {
  await ensureSeeded();
  const [[{ productCount }], [{ reviewCount, avgRating }]] = await Promise.all([
    db.select({ productCount: count() }).from(products),
    db.select({ reviewCount: count(), avgRating: avg(reviews.rating) }).from(reviews),
  ]);
  return {
    productCount: Number(productCount),
    reviewCount: Number(reviewCount),
    avgRating: Number(avgRating ?? 0),
  };
}
