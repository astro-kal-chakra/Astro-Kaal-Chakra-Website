import { routes } from "@/config/routes";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";

/** 12-sign selector. Server component — every sign is a crawlable link. */
export function ZodiacGrid({ locale, period = "daily", activeSign, variant = "grid", className }) {
  const strip = variant === "strip";
  return (
    <ul
      className={cn(
        strip
          ? "-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:pb-0 md:grid-cols-4 md:gap-4 md:px-0 lg:grid-cols-6"
          : "grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6",
        className
      )}
    >
      {ZODIAC_SIGNS.map((s) => (
        <li key={s.slug} className={strip ? "w-32 shrink-0 snap-start md:w-auto" : ""}>
          <LocaleLink
            href={routes.horoscopeSign(period, s.slug)}
            aria-current={activeSign === s.slug ? "page" : undefined}
            className={cn(
              "flex flex-col items-center rounded-2xl border p-3 text-center transition-colors",
              strip && "py-5 sm:py-6",
              activeSign === s.slug
                ? "border-gold-500 bg-gold-100 dark:bg-gold-700/20"
                : "border-line bg-surface hover:border-brand-300 hover:bg-surface-muted"
            )}
          >
            <span className={cn("leading-none text-brand-600 dark:text-gold-400", strip ? "text-5xl" : "text-3xl")} aria-hidden>
              {s.symbol}
            </span>
            <span className={cn("font-semibold", strip ? "mt-3 text-base" : "mt-2 text-sm")}>{s[locale]}</span>
            <span className={cn("whitespace-nowrap text-muted", strip ? "mt-0.5 text-xs" : "text-[11px]")}>{s.dates}</span>
          </LocaleLink>
        </li>
      ))}
    </ul>
  );
}
