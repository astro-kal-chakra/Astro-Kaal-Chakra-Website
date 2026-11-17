"use client";

import { useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { label as t } from "@/lib/labels";
import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { IST, formatTime, isoDateIn } from "@/features/tools/lib/format";
import { useVisitorPlace } from "@/features/tools/lib/useVisitorPlace";

// Longest wait for the visitor's city before the default (New Delhi) shows anyway
const MAX_WAIT_MS = 2500;

/**
 * Today's panchang inside the Kaal Chakra, for the visitor's city (from their IP). The page is rendered for
 * everyone with New Delhi (`initial`); the browser then swaps in the visitor's own city, its tithi, sunrise and
 * Rahu Kaal in its own time zone. Unknown city (or any error): New Delhi stays.
 */
export function TodayPanchang({ initial }) {
  const place = useVisitorPlace();
  const [data, setData] = useState(initial);
  const [loaded, setLoaded] = useState(false); // the visitor's city panchang came back (or failed)
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (!place) return undefined;
    let live = true;
    astroToolsService
      .getPanchang({ date: isoDateIn(new Date(), place.timezone), place })
      .then((p) => live && p && setData(p))
      .catch(() => {})
      .finally(() => live && setLoaded(true));
    return () => {
      live = false;
    };
  }, [place]);

  // Never keep the dial empty for long (slow network): show what we have
  useEffect(() => {
    const id = setTimeout(() => setWaited(true), MAX_WAIT_MS);
    return () => clearTimeout(id);
  }, []);

  // Unknown city (null): New Delhi straight away
  const settled = place === null || loaded || waited;
  if (!data) return null;
  const tz = data.place?.timezone || IST;
  const city = data.place?.name || "New Delhi";
  const tithi = data.tithi.index === 29 ? "Amavasya" : t(`tools.names.tithis.${data.tithi.index % 15}`);
  return (
    <LocaleLink
      href={routes.panchang}
      className={cn("group flex flex-col items-center gap-0.5 px-2 transition-opacity duration-300", settled ? "opacity-100" : "opacity-0")}
      aria-label={`Today's panchang for ${city}`}
    >
      <span className="max-w-[13rem] truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">Today · {city}</span>
      <span className="mt-1 font-display text-xl leading-tight text-fg sm:text-2xl">{tithi}</span>
      <span className="text-xs text-muted">{t(`tools.names.paksha.${data.tithi.paksha}`)}</span>
      <span className="mt-1 text-sm font-medium text-fg">{t(`tools.names.nakshatras.${data.nakshatra.index}`)}</span>
      <span className="mt-2 grid grid-cols-2 gap-x-4 text-[11px] leading-snug text-muted">
        <span>Sunrise</span>
        <span>Rahu Kaal</span>
        <span translate="no" className="notranslate font-semibold text-fg">
          {formatTime(data.sunrise, undefined, tz)}
        </span>
        <span translate="no" className="notranslate font-semibold text-fg">
          {formatTime(data.rahuKaal.start, undefined, tz)}
        </span>
      </span>
      <span className="mt-2 text-[11px] font-semibold text-accent group-hover:underline">Full panchang →</span>
    </LocaleLink>
  );
}
