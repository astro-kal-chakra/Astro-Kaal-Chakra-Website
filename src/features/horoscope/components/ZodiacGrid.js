import { routes } from "@/config/routes";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";

/**
 * 12-sign selector. Server component — every sign is a crawlable link.
 * `variant="strip"` is the home-page infinite carousel; `grid` is the static grid.
 */
export function ZodiacGrid({ locale, period = "daily", activeSign, variant = "grid", className }) {
  const strip = variant === "strip";
  const cards = ZODIAC_SIGNS.map((s) => (
    <LocaleLink
      key={s.slug}
      href={routes.horoscopeSign(period, s.slug)}
      aria-current={activeSign === s.slug ? "page" : undefined}
      className={cn(
        "group flex flex-col items-center rounded-2xl border p-3 text-center transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_12px_30px_-14px_rgb(194_65_12/0.35)]",
        strip && "h-full py-5 sm:py-6",
        activeSign === s.slug
          ? "border-gold-500 bg-gold-100 dark:bg-gold-700/20"
          : "border-line bg-surface hover:border-brand-300 hover:bg-surface-muted"
      )}
    >
      <span className={cn("inline-block leading-none text-brand-600 motion-safe:group-hover:animate-wiggle dark:text-gold-400", strip ? "text-5xl" : "text-3xl")} aria-hidden>
        {s.symbol}
      </span>
      <span className={cn("font-semibold", strip ? "mt-3 text-base" : "mt-2 text-sm")}>{s[locale]}</span>
      <span className={cn("text-muted", strip ? "mt-0.5 whitespace-nowrap text-xs" : "text-[11px] leading-tight")}>{s.dates}</span>
    </LocaleLink>
  ));

  if (strip) {
    return (
      <CardCarousel label="Zodiac signs" slideClassName="basis-[42%] sm:basis-1/3 md:basis-1/4 lg:basis-1/6" className={className}>
        {cards}
      </CardCarousel>
    );
  }

  return (
    <ul className={cn("grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6", className)}>
      {cards.map((card) => (
        <li key={card.key}>{card}</li>
      ))}
    </ul>
  );
}
