import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Family Shoppers — Style for the whole family",
    template: "%s · Family Shoppers",
  },
  description:
    "Well-made clothing for men, women and kids at prices that make sense. Free shipping over $75, easy returns, and styles the whole family will love.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster />
      </body>
    </html>
  );
}
