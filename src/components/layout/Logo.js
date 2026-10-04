import { useId } from "react";
import { siteConfig } from "@/config/site";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";

/**
 * Brand mark modelled on the Astro-Kaal-Chakra logo: zodiac wheel with a
 * compass star, crescent, orbit ring and planet in the logo's
 * light saffron → saffron gradient. Swap for the official SVG when available.
 */
export function LogoMark({ className }) {
  const id = useId().replace(/:/g, "");
  const g = `akc-g-${id}`;
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg viewBox="0 0 48 48" className={cn("size-9 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="0.5" stopColor="#fb8a3c" />
          <stop offset="1" stopColor="#f26b1d" />
        </linearGradient>
      </defs>
      {/* crescent */}
      <path d="M24 3a21 21 0 1 0 17.5 32.6A18 18 0 1 1 24 6.2Z" fill={`url(#${g})`} />
      {/* zodiac wheel */}
      <circle cx="25" cy="23" r="13" fill="none" stroke={`url(#${g})`} strokeWidth="1.4" />
      <circle cx="25" cy="23" r="8" fill="none" stroke={`url(#${g})`} strokeWidth="1" />
      {ticks.map((a) => (
        <line key={a} x1="25" y1="10" x2="25" y2="15" stroke={`url(#${g})`} strokeWidth="1" transform={`rotate(${a} 25 23)`} />
      ))}
      {/* compass star */}
      <path d="M25 14.5l1.6 6.9 6.9 1.6-6.9 1.6-1.6 6.9-1.6-6.9-6.9-1.6 6.9-1.6Z" fill="#fb8a3c" />
      {/* orbit + planet */}
      <ellipse cx="25" cy="25" rx="22" ry="6" fill="none" stroke={`url(#${g})`} strokeWidth="2.2" transform="rotate(-14 25 25)" />
      <circle cx="44.5" cy="19.5" r="3" fill="#f26b1d" stroke="#fdae74" strokeWidth="0.8" />
    </svg>
  );
}

/** Header/footer logo. `onDark` uses the bright wordmark gradient. */
export function Logo({ className, onDark = false }) {
  return (
    <LocaleLink
      href="/"
      translate="no"
      aria-label={siteConfig.name}
      className={cn("notranslate flex shrink-0 items-center gap-2 font-display text-xl tracking-tight sm:text-[1.4rem]", className)}
    >
      <LogoMark />
      <span
        className={cn(
          "bg-clip-text text-transparent max-[430px]:hidden",
          onDark
            ? "bg-gradient-to-r from-white to-brand-50"
            : "bg-gradient-to-r from-gold-600 via-brand-600 to-brand-700 dark:from-gold-300 dark:via-brand-300 dark:to-brand-400"
        )}
      >
        {siteConfig.name}
      </span>
    </LocaleLink>
  );
}
