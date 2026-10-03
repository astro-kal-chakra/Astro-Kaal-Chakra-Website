"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Moon, MoonStar, Sunrise, Sunset } from "lucide-react";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Skeleton";
import { PlaceAutocomplete } from "@/features/auth/components/PlaceAutocomplete";
import { IST, addDays, formatPlainDate, formatTime, isoDateIn } from "../lib/format";
import { useAstroNames } from "../lib/useAstroNames";
import { MockNotice } from "./MockNotice";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

function Limb({ label, value, sub, until }) {
  return (
    <div className="rounded-xl bg-surface-muted p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1">
        <span className="block text-lg font-semibold">{value}</span>
        {sub && <span className="block text-sm text-muted">{sub}</span>}
        {until && <span className="block text-xs text-muted">{until}</span>}
      </dd>
    </div>
  );
}

function TimeRow({ label, desc, range, tone }) {
  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className={cn("font-semibold", tone === "bad" ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400")}>
          {label}
        </p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <p className="shrink-0 text-right font-medium tabular-nums">{range}</p>
    </li>
  );
}

/**
 * Interactive Panchang: date picker + city selector. First render uses server-fetched data for SEO.
 * @param {{ initialData: object, initialDate: string, defaultCity: object }} props
 */
export function PanchangTool({ initialData, initialDate, defaultCity }) {
  const locale = SITE_LOCALE;
  const n = useAstroNames();
  const [date, setDate] = useState(initialDate);
  const [place, setPlace] = useState(defaultCity); // last valid place (drives the data)
  const [placeInput, setPlaceInput] = useState(defaultCity); // autocomplete value (null while typing)
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const reqId = useRef(0);

  const load = async (nextDate, nextPlace) => {
    const id = ++reqId.current;
    setLoading(true);
    setError(false);
    try {
      const res = await astroToolsService.getPanchang({ date: nextDate, place: nextPlace });
      if (id === reqId.current) setData(res);
    } catch {
      if (id === reqId.current) setError(true);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  const changeDate = (next) => {
    if (!next) return;
    setDate(next);
    load(next, place);
  };

  const changePlace = (next) => {
    setPlaceInput(next);
    if (next) {
      setPlace(next);
      load(date, next);
    }
  };

  const tz = data.place?.timezone || IST;
  const time = (iso) => formatTime(iso, locale, tz);
  const range = (r) => `${time(r.start)} – ${time(r.end)}`;
  const until = (iso) => {
    const nextDay = isoDateIn(new Date(iso), tz) > data.date;
    return (nextDay ? `until ${time(iso)}, next day` : `until ${time(iso)}`);
  };

  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[auto_1fr] sm:items-end sm:p-5">
        <Field label="Date" htmlFor="panchang-date">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={() => changeDate(addDays(date, -1))} aria-label="Previous day">
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Input
              id="panchang-date"
              type="date"
              value={date}
              onChange={(e) => changeDate(e.target.value)}
              className="w-auto min-w-40"
            />
            <Button variant="outline" size="icon" onClick={() => changeDate(addDays(date, 1))} aria-label="Next day">
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => changeDate(isoDateIn(new Date(), IST))}>
              Today
            </Button>
          </div>
        </Field>
        <Field label="City" htmlFor="panchang-city">
          <PlaceAutocomplete id="panchang-city" value={placeInput} onChange={changePlace} placeholder="Start typing a city" />
        </Field>
      </Card>

      <section aria-live="polite" aria-busy={loading} className={cn("space-y-4 transition-opacity", loading && "opacity-60")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold">
            {`Panchang for ${formatPlainDate(data.date, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
          </h2>
          <p className="flex items-center gap-2 text-sm text-muted">
            {loading && <Spinner className="size-4" />}
            {`in ${[data.place?.name, data.place?.region].filter(Boolean).join(", ")}`}
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            Could not load Panchang for this date.
          </p>
        )}
        <MockNotice show={data.isMock} />

        <Card className="p-4 sm:p-5">
          <h3 className="mb-3 font-semibold">Panchang elements</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Limb label="Tithi" value={n.tithi(data.tithi.index)} sub={n.paksha(data.tithi.paksha)} until={until(data.tithi.endsAt)} />
            <Limb label="Nakshatra" value={n.nakshatra(data.nakshatra.index)} until={until(data.nakshatra.endsAt)} />
            <Limb label="Yoga" value={n.yoga(data.yoga.index)} until={until(data.yoga.endsAt)} />
            <Limb label="Karana" value={n.karana(data.karana.index)} until={until(data.karana.endsAt)} />
            <Limb label="Vaar (weekday)" value={n.weekday(data.vaar)} />
            <Limb label="Paksha" value={n.paksha(data.tithi.paksha)} />
          </dl>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-4 sm:p-5">
            <h3 className="mb-3 font-semibold">Sun and Moon</h3>
            <ul className="grid grid-cols-2 gap-3">
              {[
                { key: "sunrise", icon: Sunrise, cls: "text-gold-500" },
                { key: "sunset", icon: Sunset, cls: "text-orange-500" },
                { key: "moonrise", icon: MoonStar, cls: "text-brand-500 dark:text-brand-300" },
                { key: "moonset", icon: Moon, cls: "text-brand-400" },
              ].map(({ key, icon: Icon, cls }) => (
                <li key={key} className="rounded-xl bg-surface-muted p-3">
                  <Icon className={cn("size-5", cls)} aria-hidden />
                  <p className="mt-1 text-xs text-muted">{t(`tools.panchang.${key}`)}</p>
                  <p className="font-semibold tabular-nums">{time(data[key])}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 sm:p-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold">Inauspicious timings</h3>
                <ul className="divide-y divide-line">
                  <TimeRow tone="bad" label="Rahu Kaal" desc="Avoid starting new work or travel." range={range(data.rahuKaal)} />
                  <TimeRow tone="bad" label="Gulika Kaal" desc="Avoid important beginnings." range={range(data.gulika)} />
                  <TimeRow tone="bad" label="Yamaganda" desc="Not favourable for auspicious work." range={range(data.yamaganda)} />
                </ul>
              </div>
              <div className="mt-4 sm:mt-0">
                <h3 className="font-semibold">Auspicious timing</h3>
                <ul className="divide-y divide-line">
                  <TimeRow tone="good" label="Abhijit Muhurat" desc="The most auspicious window around midday." range={range(data.abhijit)} />
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
