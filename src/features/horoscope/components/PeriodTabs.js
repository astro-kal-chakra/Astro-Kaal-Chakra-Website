import { routes } from "@/config/routes";
import { HOROSCOPE_PERIODS } from "@/constants/zodiac";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn } from "@/lib/utils/cn";
import { label as t } from "@/lib/labels";

export function PeriodTabs({ sign, active }) {
  return (
    <nav className="flex gap-1 rounded-full bg-surface-muted p-1" aria-label="Horoscope period">
      {HOROSCOPE_PERIODS.map((p) => (
        <LocaleLink
          key={p}
          href={routes.horoscopeSign(p, sign)}
          aria-current={active === p ? "page" : undefined}
          className={cn(
            "flex-1 rounded-full px-3 py-2 text-center text-sm font-medium",
            active === p ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
          )}
        >
          {t(`horoscope.${p}`)}
        </LocaleLink>
      ))}
    </nav>
  );
}
