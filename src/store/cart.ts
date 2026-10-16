"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  lastAdded: CartItem | null;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "key" | "quantity"> & { quantity?: number }) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setHydrated: (v: boolean) => void;
};

export const makeKey = (productId: number, size: string, color: string) =>
  `${productId}::${size}::${color}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAdded: null,
      hydrated: false,
      addItem: (input) => {
        const key = makeKey(input.productId, input.size, input.color);
        const qty = input.quantity ?? 1;
        const items = [...get().items];
        const idx = items.findIndex((i) => i.key === key);
        if (idx >= 0) {
          const next = Math.min(items[idx].quantity + qty, items[idx].maxStock);
          items[idx] = { ...items[idx], quantity: next };
        } else {
          items.unshift({ ...input, key, quantity: Math.min(qty, input.maxStock) });
        }
        set({ items, isOpen: true, lastAdded: items.find((i) => i.key === key) ?? null });
      },
      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i,
          ),
        });
      },
      clear: () => set({ items: [], lastAdded: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "family-shoppers-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s: CartState) => s.items.reduce((n, i) => n + i.price * i.quantity, 0);
