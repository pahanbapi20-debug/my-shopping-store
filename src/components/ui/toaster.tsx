"use client";

import { create } from "zustand";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";

type Toast = { id: number; message: string; kind: "success" | "error" | "info" };

type ToastState = {
  toasts: Toast[];
  push: (message: string, kind?: Toast["kind"]) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = "success") => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, kind?: Toast["kind"]) {
  useToast.getState().push(message, kind);
}

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  useEffect(() => {
    // no-op: ensures client-side hydration boundary
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink-900 px-4 py-2.5 text-sm text-cream-50 shadow-2xl animate-pop"
        >
          {t.kind === "success" && <CheckCircle2 className="h-4 w-4 text-gold-400" />}
          {t.kind === "error" && <XCircle className="h-4 w-4 text-terra-400" />}
          {t.kind === "info" && <Info className="h-4 w-4 text-cream-300" />}
          <span>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-1 rounded-full p-0.5 text-cream-300 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
