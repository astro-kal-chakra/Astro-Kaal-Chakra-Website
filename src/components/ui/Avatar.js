import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const initials = (name = "") =>
  name
    .replace(/^(Acharya|Pandit|Dr\.|Guru|Tarot( Reader)?|Astro|Numerologist|Vastu Expert)\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** Photo avatar with an initials fallback. */
export function Avatar({ src, name, size = 64, className, priority = false }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-800 ring-2 ring-gold-400/60",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" priority={priority} />
      ) : (
        <span
          translate="no"
          className="notranslate flex size-full items-center justify-center font-display font-semibold text-gold-200"
          style={{ fontSize: size * 0.34 }}
          aria-hidden
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
