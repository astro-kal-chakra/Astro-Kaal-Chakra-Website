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
            "min-w-0 flex-1 rounded-full px-1.5 py-2 text-center text-xs font-medium min-[360px]:px-3 min-[360px]:text-sm",
            active === p ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
          )}
        >
          {t(`horoscope.${p}`)}
        </LocaleLink>
      ))}
    </nav>
  );
}
