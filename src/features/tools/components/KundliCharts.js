"use client";

import { Card } from "@/components/ui/Card";
import { useAstroNames } from "../lib/useAstroNames";
import { ChartNorthIndian } from "./ChartNorthIndian";
import { ChartSouthIndian } from "./ChartSouthIndian";

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
  const { houses, signs, bySign, ascendantSign } = buildChartData(kundli, names.planetShort);

  const charts = [
    {
      key: "north",
      label: "North Indian",
      legend: "Numbers show the sign in each house (1 = Aries … 12 = Pisces). R = retrograde.",
      node: <ChartNorthIndian houses={houses} signs={signs} title={`${"North Indian"} style Lagna chart showing planets in the twelve houses`} />,
    },
    {
      key: "south",
      label: "South Indian",
      legend: "Signs are fixed in the South Indian chart. The diagonal line marks the ascendant.",
      node: (
        <ChartSouthIndian
          signs={bySign}
          ascendantSign={ascendantSign}
          signLabels={names.signLabels}
          centerLabel="Lagna (birth) chart"
          title={`${"South Indian"} style Lagna chart showing planets in the twelve houses`}
        />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {charts.map((c) => (
        <Card key={c.key} as="figure" className="flex flex-col items-center p-4 sm:p-5">
          <h3 className="mb-3 self-start font-semibold">
            {c.label} <span className="font-normal text-muted">· Lagna (birth) chart</span>
          </h3>
          {c.node}
          <figcaption className="mt-3 self-start text-xs text-muted">{c.legend}</figcaption>
        </Card>
      ))}
    </div>
  );
}
