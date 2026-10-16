import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = Number(body.productId);
    const rating = Number(body.rating);
    const author = String(body.author ?? "").trim();
    const title = String(body.title ?? "").trim();
    const text = String(body.body ?? "").trim();

    if (!Number.isInteger(productId)) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    if (author.length < 2 || author.length > 100) return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    if (title.length < 2 || title.length > 160) return NextResponse.json({ error: "Please add a short title" }, { status: 400 });
    if (text.length < 10 || text.length > 2000)
      return NextResponse.json({ error: "Review should be at least 10 characters" }, { status: 400 });

    const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const [review] = await db
      .insert(reviews)
      .values({ productId, rating, author, title, body: text, verified: false })
      .returning();

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }
}
