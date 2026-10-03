"use client";

import { useMemo } from "react";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

/** Translate language-neutral astro keys/indexes from the API into display names. */
export function useAstroNames() {
  const locale = SITE_LOCALE;
  return useMemo(
    () => ({
      sign: (i) => ZODIAC_SIGNS[i]?.[locale] ?? "—",
      signShort: (i) => t(`tools.names.signsShort.${i}`),
      nakshatra: (i) => t(`tools.names.nakshatras.${i}`),
      planet: (key) => t(`tools.names.planets.${key}`),
      planetShort: (key) => t(`tools.names.planetsShort.${key}`),
      /** 0-29 across both pakshas → name (Purnima / Amavasya at 14 / 29). */
      tithi: (i) => (i === 29 ? "Amavasya" : t(`tools.names.tithis.${i % 15}`)),
      yoga: (i) => t(`tools.names.yogas.${i}`),
      karana: (i) => t(`tools.names.karanas.${i}`),
      weekday: (i) => t(`tools.names.weekdays.${i}`),
      paksha: (key) => t(`tools.names.paksha.${key}`),
      gana: (key) => t(`tools.names.gana.${key}`),
      nadi: (key) => t(`tools.names.nadi.${key}`),
      varna: (key) => t(`tools.names.varna.${key}`),
      element: (key) => t(`tools.names.elements.${key}`),
      signLabels: Array.from({ length: 12 }, (_, i) => t(`tools.names.signsShort.${i}`)),
    }),
    [locale]
  );
}
