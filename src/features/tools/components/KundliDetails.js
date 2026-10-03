"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatClock, formatDegree, formatPlainDate } from "../lib/format";
import { useAstroNames } from "../lib/useAstroNames";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

function DefinitionList({ rows }) {
  return (
    <dl className="divide-y divide-line">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
          <dt className="text-muted">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "Basic details" tab: birth data + key astrological attributes. */
export function KundliBasic({ kundli }) {
  const locale = SITE_LOCALE;
  const n = useAstroNames();
  const { input, basic } = kundli;

  const birth = [
    input.name && ["Name", input.name],
    input.gender && ["Gender", t(`tools.common.${input.gender}`)],
    ["Date of birth", formatPlainDate(input.date, locale)],
    ["Time of birth", formatClock(input.time, locale)],
    input.place && ["Place of birth", [input.place.name, input.place.region].filter(Boolean).join(", ")],
    input.place?.lat != null && ["Coordinates", `${input.place.lat.toFixed(2)}° N, ${input.place.lng.toFixed(2)}° E`],
  ].filter(Boolean);

  const astro = [
    ["Ascendant (Lagna)", `${n.sign(basic.ascendant)} · ${formatDegree(basic.ascendantDegree)}`],
    ["Moon sign (Rashi)", n.sign(basic.moonSign)],
    ["Sun sign", n.sign(basic.sunSign)],
    ["Nakshatra", `${n.nakshatra(basic.nakshatra)}, Pada ${basic.pada}`],
    ["Nakshatra lord", n.planet(basic.nakshatraLord)],
    ["Birth tithi", `${n.tithi(basic.tithi)} · ${n.paksha(basic.paksha)}`],
    ["Gana", n.gana(basic.gana)],
    ["Nadi", n.nadi(basic.nadi)],
    ["Varna", n.varna(basic.varna)],
    [
      "Manglik",
      basic.manglik ? (
        <Badge tone="warning">{`Yes (Mars in house ${basic.marsHouse})`}</Badge>
      ) : (
        <Badge tone="success">No</Badge>
      ),
    ],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="p-4 sm:p-5">
        <h3 className="mb-1 font-semibold">Birth details</h3>
        <DefinitionList rows={birth} />
      </Card>
      <Card className="p-4 sm:p-5">
        <h3 className="mb-1 font-semibold">Astrological details</h3>
        <DefinitionList rows={astro} />
      </Card>
    </div>
  );
}

/** "Planets" tab: positions table. */
export function KundliPlanets({ kundli }) {
  const n = useAstroNames();
  const { basic } = kundli;
  const rows = [
    {
      key: "ascendant",
      sign: basic.ascendant,
      degree: basic.ascendantDegree,
      nakshatra: basic.ascendantNakshatra,
      pada: null,
      house: 1,
      retrograde: null,
    },
    ...kundli.planets,
  ];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted">
            <tr>
              {["planet", "sign", "degree", "nakshatra", "house", "status"].map((c) => (
                <th key={c} scope="col" className="px-4 py-3 font-semibold">
                  {t(`tools.kundli.${c}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) => (
              <tr key={p.key} className="hover:bg-surface-muted/50">
                <th scope="row" className="px-4 py-3 font-semibold">
                  {n.planet(p.key)}
                </th>
                <td className="px-4 py-3">{n.sign(p.sign)}</td>
                <td className="px-4 py-3 tabular-nums">{formatDegree(p.degree)}</td>
                <td className="px-4 py-3">
                  {n.nakshatra(p.nakshatra)}
                  {p.pada && <span className="text-muted"> · {`Pada ${p.pada}`}</span>}
                </td>
                <td className="px-4 py-3 tabular-nums">{p.house}</td>
                <td className="px-4 py-3">
                  {p.retrograde == null ? (
                    <span className="text-muted">—</span>
                  ) : p.retrograde ? (
                    <Badge tone="warning">Retrograde</Badge>
                  ) : (
                    <Badge>Direct</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
