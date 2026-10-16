import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data";
import { ShopPage, type SearchParams } from "@/components/shop/shop-page";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Not found" };
  return { title: `${cat.name}'s Collection`, description: cat.description };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ category }, sp] = await Promise.all([params, searchParams]);
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();
  return <ShopPage category={cat} searchParams={sp} />;
}
