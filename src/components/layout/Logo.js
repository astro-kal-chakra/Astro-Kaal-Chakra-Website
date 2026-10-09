import Image from "next/image";
import { siteConfig } from "@/config/site";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";

/**
 * Round badge cut from the official emblem (brand/logo-source.png → brand/generate-icons.js);
 * the full emblem with its points is too detailed at header size.
 */
export function LogoMark({ className, priority = false }) {
  return (
    
    <Image
      src="/images/logo-mark.png"
      alt=""
      width={48}
      height={48}
      priority={priority}
      className={cn("size-12 shrink-0 rounded-full object-contain drop-shadow-sm", className)}
    />
  );
}

/**
 * Header/footer logo. `onDark` uses the bright wordmark gradient; `priority` for above-the-fold use (header).
 * `wordmarkClassName` controls when the "Astro-Kaal-Chakra" text shows (the emblem alone carries the name).
 */
export function Logo({ className, onDark = false, priority = false, wordmarkClassName }) {
  return (
    <LocaleLink
      href="/"
      translate="no"
      aria-label={siteConfig.name}
      className={cn("notranslate flex min-w-0 items-center gap-2 font-display text-xl tracking-tight sm:text-[1.4rem]", className)}
    >
      <LogoMark priority={priority} />
      <span
        className={cn(
          // min-w-0 + truncate: if space ever runs out the name shortens instead of widening the page
          "min-w-0 truncate bg-clip-text text-transparent",
          wordmarkClassName,
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
