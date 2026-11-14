"use client";

import { useSyncExternalStore } from "react";
import { Card } from "@/components/ui/Card";
import { ZODIAC_SIGNS } from "@/constants/zodiac";
import { PAGE_LANGUAGE } from "@/features/translate/config";
import { getCurrentLanguage, subscribeLanguage } from "@/features/translate/lib/googleTranslate";
import { useAstroNames } from "../lib/useAstroNames";
import { ChartNorthIndian } from "./ChartNorthIndian";
import { ChartSouthIndian } from "./ChartSouthIndian";

/**
 * Google Translate can't translate text inside the chart SVGs (and mangles two-letter
 * abbreviations like "Su"/"Mo"), so the charts render their own Hindi labels and the
 * cards are marked `notranslate`.
 */
const HI_PLANETS_SHORT = {
  ascendant: "ल",
  sun: "सू",
  moon: "चं",
  mars: "मं",
  mercury: "बु",
  jupiter: "गु",
  venus: "शु",
  saturn: "श",
  rahu: "रा",
  ketu: "के",
};

const COPY = {
  en: {
    chart: "Lagna (birth) chart",
    retro: "R",
    north: "North Indian",
    south: "South Indian",
    northLegend: "Numbers show the sign in each house (1 = Aries … 12 = Pisces). R = retrograde.",
    southLegend: "Signs are fixed in the South Indian chart. The diagonal line marks the ascendant.",
    northTitle: "North Indian style Lagna chart showing planets in the twelve houses",
    southTitle: "South Indian style Lagna chart showing planets in the twelve houses",
  },
  hi: {
    chart: "लग्न (जन्म) कुंडली",
    retro: "व",
    north: "उत्तर भारतीय",
    south: "दक्षिण भारतीय",
    northLegend: "संख्याएँ प्रत्येक भाव में स्थित राशि को दर्शाती हैं (1 = मेष … 12 = मीन)। व = वक्री।",
    southLegend: "दक्षिण भारतीय कुंडली में राशियाँ निश्चित होती हैं। तिरछी रेखा लग्न को दर्शाती है।",
    northTitle: "बारह भावों में ग्रहों को दर्शाती उत्तर भारतीय लग्न कुंडली",
    southTitle: "बारह भावों में ग्रहों को दर्शाती दक्षिण भारतीय लग्न कुंडली",
  },
};

/** Build chart inputs from the API's planets list: { house: [planets] } and { sign: [planets] } (1-based). */
export function buildChartData(kundli, planetShort) {
  const asc = kundli.basic.ascendant;
  const ascItem = { label: planetShort("ascendant"), highlight: true };
  const houses = { 1: [ascItem] };
  const bySign = { [asc + 1]: [ascItem] };
  const signs = {};
  for (let h = 1; h <= 12; h++) signs[h] = ((asc + h - 1) % 12) + 1;
  for (const p of kundli.planets) {
    const item = { label: planetShort(p.key), retro: p.retrograde && p.key !== "rahu" && p.key !== "ketu" };
    (houses[p.house] ||= []).push(item);
    (bySign[p.sign + 1] ||= []).push(item);
  }
  return { houses, signs, bySign, ascendantSign: asc + 1 };
}

export function KundliCharts({ kundli }) {
  const names = useAstroNames();
  const lang = useSyncExternalStore(subscribeLanguage, getCurrentLanguage, () => PAGE_LANGUAGE);
  const hi = lang === "hi";
  const copy = hi ? COPY.hi : COPY.en;
  const planetShort = hi ? (key) => HI_PLANETS_SHORT[key] ?? names.planetShort(key) : names.planetShort;
  const signLabels = hi ? ZODIAC_SIGNS.map((s) => s.hi) : names.signLabels;
  const { houses, signs, bySign, ascendantSign } = buildChartData(kundli, planetShort);

  const charts = [
    {
      key: "north",
      label: copy.north,
      legend: copy.northLegend,
      node: <ChartNorthIndian houses={houses} signs={signs} retroLabel={copy.retro} title={copy.northTitle} />,
    },
    {
      key: "south",
      label: copy.south,
      legend: copy.southLegend,
      node: (
        <ChartSouthIndian
          signs={bySign}
          ascendantSign={ascendantSign}
          signLabels={signLabels}
          centerLabel={copy.chart}
          retroLabel={copy.retro}
          title={copy.southTitle}
        />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {charts.map((c) => (
        <Card key={`${c.key}-${lang}`} as="figure" translate="no" lang={hi ? "hi" : "en"} className="notranslate flex flex-col items-center p-4 sm:p-5">
          <h3 className="mb-3 self-start font-semibold">
            {c.label} <span className="font-normal text-muted">· {copy.chart}</span>
          </h3>
          {c.node}
          <figcaption className="mt-3 self-start text-xs text-muted">{c.legend}</figcaption>
        </Card>
      ))}
    </div>
  );
}
