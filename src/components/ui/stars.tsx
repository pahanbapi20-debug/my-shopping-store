import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const px = { xs: "h-3 w-3", sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className={cn("relative inline-block", px)}>
            <Star className={cn("absolute inset-0 text-cream-300", px)} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("text-gold-500", px)} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
