"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { formatPlainDate, isoDateIn } from "../lib/format";
import { useAstroNames } from "../lib/useAstroNames";
import { SITE_LOCALE } from "@/config/locale";

const SHORT = { day: "numeric", month: "short", year: "numeric" };
const isCurrent = (p, today) => p.start <= today && today < p.end;

/** Vimshottari Mahadasha list; each expands (native <details>) to its Antardashas. */
export function KundliDasha({ dasha }) {
  const locale = SITE_LOCALE;
  const n = useAstroNames();
  const [today] = useState(() => isoDateIn(new Date()));
  const fmt = (d) => formatPlainDate(d, locale, SHORT);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Vimshottari Dasha is a 120-year cycle of planetary periods that starts from the lord of your birth nakshatra. Tap a Mahadasha to see its Antardashas.</p>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {dasha.map((md) => {
          const current = isCurrent(md, today);
          return (
            <li key={md.lord + md.start}>
              <details className="group" open={current}>
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden",
                    current && "bg-brand-50 dark:bg-brand-900/40"
                  )}
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-semibold text-brand-700 dark:bg-brand-800 dark:text-gold-300"
                    aria-hidden
                  >
                    {n.planetShort(md.lord)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {n.planet(md.lord)} Mahadasha
                      {current && <Badge tone="gold">Current</Badge>}
                    </span>
                    <span className="block text-sm text-muted">
                      {`${fmt(md.start)} – ${fmt(md.end)}`} ·{" "}
                      {`${md.years} years`}
                    </span>
                  </span>
                  <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <caption className="sr-only">
                      {n.planet(md.lord)} Mahadasha – Antardasha
                    </caption>
                    <thead className="text-left text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th scope="col" className="py-2 font-semibold">
                          Antardasha
                        </th>
                        <th scope="col" className="py-2 text-right font-semibold">
                          Period
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {md.antardashas.map((ad) => {
                        const cur = isCurrent(ad, today);
                        return (
                          <tr key={ad.lord + ad.start} className={cn(cur && "font-semibold text-brand-700 dark:text-gold-300")}>
                            <td className="py-2">
                              {n.planet(md.lord)} – {n.planet(ad.lord)}
                              {cur && <span className="sr-only"> (Current)</span>}
                            </td>
                            <td className="py-2 text-right tabular-nums">
                              {fmt(ad.start)} – {fmt(ad.end)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
