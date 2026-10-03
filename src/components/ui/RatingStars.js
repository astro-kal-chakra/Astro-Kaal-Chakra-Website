import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function RatingStars({ value = 0, size = 14, className, showValue = false }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-gold-500 text-gold-500" : "text-line"}
          aria-hidden
        />
      ))}
      {showValue && <span className="ml-1 text-sm font-semibold">{value.toFixed(1)}</span>}
    </span>
  );
}
