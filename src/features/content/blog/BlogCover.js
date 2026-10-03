import { cn } from "@/lib/utils/cn";

const FALLBACK = { from: "from-brand-600", to: "to-brand-900", glyph: "✦" };

/** Illustrated gradient cover placeholder — no external images needed. */
export function BlogCover({ cover, className, size = "md" }) {
  const c = cover || FALLBACK;
  return (
    <div
      className={cn("relative overflow-hidden bg-gradient-to-br", c.from, c.to, size === "lg" ? "aspect-[16/10]" : "aspect-[16/9]", className)}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute -bottom-16 -right-10 size-56 rounded-full border border-white/15" />
      <div className="absolute -bottom-8 -right-2 size-36 rounded-full border border-dashed border-gold-300/30" />
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-display text-gold-200 drop-shadow-[0_0_24px_rgb(229_190_90/0.55)]",
          size === "lg" ? "text-8xl" : "text-6xl"
        )}
      >
        {c.glyph}
      </span>
    </div>
  );
}
