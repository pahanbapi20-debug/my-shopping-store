import type { Metadata } from "next";
import { ShopPage, type SearchParams } from "@/components/shop/shop-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse every style for men, women and kids at Family Shoppers.",
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  return <ShopPage searchParams={sp} />;
}
