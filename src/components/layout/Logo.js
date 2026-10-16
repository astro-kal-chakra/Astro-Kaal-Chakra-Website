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
      alt={`${siteConfig.name} logo`}
      width={48}
      height={48}
      priority={priority}
      className={cn("size-12 shrink-0 rounded-full object-contain drop-shadow-sm", className)}
    />
  );
}


/** `asLink={false}`: plain branding (e.g. the footer), so the page doesn't repeat the header's link home. */
export function Logo({ className, onDark = false, priority = false, wordmarkClassName, asLink = true }) {
  const Root = asLink ? LocaleLink : "div";
  return (
    <Root
      {...(asLink ? { href: "/", "aria-label": siteConfig.name } : {})}
      translate="no"
      className={cn("notranslate flex min-w-0 items-center gap-2 font-display text-xl tracking-tight sm:text-[1.4rem]", className)}
    >
      <LogoMark priority={priority} />
      <span
        data-wordmark
        className={cn(
          // min-w-0 + truncate: a last-resort safety so the page never widens; the header's useNameFit()
          // hides optional menu links first, so in practice the full name always shows
          "min-w-0 truncate bg-clip-text text-transparent",
          wordmarkClassName,
          onDark
            ? "bg-gradient-to-r from-white to-brand-50"
            : "bg-gradient-to-r from-gold-600 via-brand-600 to-brand-700 dark:from-gold-300 dark:via-brand-300 dark:to-brand-400"
        )}
      >
        {siteConfig.name}
      </span>
    </Root>
  );
}
