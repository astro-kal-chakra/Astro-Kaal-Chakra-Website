"use client";

import { useState } from "react";
import { ArrowRight, MoonStar, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { isoDateIn } from "../lib/format";
import { useAstroNames } from "../lib/useAstroNames";
import { findSunSign } from "../lib/zodiac";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

/** Sun sign from date of birth — real calculation from ZODIAC_SIGNS dates, fully client-side. */
export function ZodiacFinderTool() {
  const locale = SITE_LOCALE;
  const n = useAstroNames();
  const [dob, setDob] = useState("");
  const [error, setError] = useState(null);
  const [sign, setSign] = useState(null);
  const [today] = useState(() => isoDateIn(new Date()));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!dob) return setError("tools.common.required");
    if (dob > today) return setError("tools.common.futureDate");
    setError(null);
    setSign(findSunSign(dob));
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card as="form" onSubmit={onSubmit} noValidate className="space-y-5 p-5 sm:p-6">
        <Field label="Your date of birth" htmlFor="zodiac-dob" error={error ? t(error) : undefined}>
          <Input
            id="zodiac-dob"
            type="date"
            value={dob}
            max={today}
            min="1900-01-01"
            onChange={(e) => {
              setDob(e.target.value);
              setError(null);
            }}
            aria-invalid={Boolean(error) || undefined}
            required
          />
        </Field>
        <Button type="submit" variant="gold" size="lg" className="w-full">
          <Sparkles className="size-5" aria-hidden /> Find my sign
        </Button>
      </Card>

      <section aria-live="polite" className="min-w-0 space-y-4">
        {sign && (
          <>
            <Card className="bg-cosmic overflow-hidden border-0 p-6 text-white sm:p-8">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <span className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-6xl text-gold-300 ring-1 ring-gold-400/40" aria-hidden>
                  {sign.symbol}
                </span>
                <div>
                  <p className="text-sm text-brand-100">Your zodiac sign is</p>
                  <h2 className="text-brand-600 dark:text-brand-400 font-display text-4xl font-semibold">{sign[locale]}</h2>
                  <p className="mt-2 max-w-md text-brand-100">{t(`tools.zodiac.traits.${sign.slug}`)}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  ["Dates", sign.dates],
                  ["Element", n.element(sign.element)],
                  ["Ruling planet", n.planet(sign.ruler)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white/10 p-3">
                    <dt className="text-xs text-brand-200">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href={routes.horoscopeSign("daily", sign.slug)} variant="gold" className="mt-6">
                {`Read today's ${sign[locale]} horoscope`} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </Card>

            <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
                <MoonStar className="size-6" aria-hidden />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">What about your Moon sign?</h3>
                <p className="mt-0.5 text-sm text-muted">Vedic astrology gives the most importance to your Moon sign (Rashi), which can differ from your sun sign. Finding it needs your exact birth time and place.</p>
              </div>
              <ButtonLink href={routes.kundli} variant="outline" className="shrink-0">
                Find my Moon sign with free Kundli
              </ButtonLink>
            </Card>
          </>
        )}
      </section>
    </div>
  );
}
