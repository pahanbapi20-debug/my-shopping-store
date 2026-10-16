"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Gallery({ images, name, badge }: { images: string[]; name: string; badge?: string | null }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const go = (dir: 1 | -1) => setActive((a) => (a + dir + images.length) % images.length);

  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr]">
      <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto no-scrollbar">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-[3/4] w-16 shrink-0 md:w-full overflow-hidden rounded-lg bg-cream-200 ring-2 ring-offset-2 ring-offset-cream-50 transition",
              active === i ? "ring-ink-900" : "ring-transparent hover:ring-cream-300",
            )}
            aria-label={`View image ${i + 1}`}
          >
            <Image src={src} alt="" fill sizes="72px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        className="order-1 md:order-2 relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-200 group cursor-zoom-in"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {images.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={`${name} — view ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            className={cn(
              "object-cover transition-all duration-500",
              active === i ? "opacity-100" : "opacity-0",
              zoom && active === i ? "scale-[1.6]" : "scale-100",
            )}
            style={zoom && active === i ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        ))}

        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-terra-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream-50/90 text-ink-900 opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-cream-50/90 text-ink-900 opacity-0 shadow transition hover:bg-white group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1.5 rounded-full bg-cream-50 transition-all", active === i ? "w-6" : "w-1.5 opacity-60")}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
