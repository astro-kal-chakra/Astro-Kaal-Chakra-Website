"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { isoDateIn } from "../lib/format";
import { calculateNumerology, isMaster, normalizeName } from "../lib/numerology";
import { label as t } from "@/lib/labels";

const NUMBERS = ["lifePath", "destiny", "soulUrge", "personality"];

/** Pythagorean numerology — real calculations, fully client-side. */
export function NumerologyTool() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [today] = useState(() => isoDateIn(new Date()));

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = "tools.common.required";
    else if (!normalizeName(name)) errs.name = "tools.numerology.nameLatin";
    if (!dob) errs.dob = "tools.common.required";
    else if (dob > today) errs.dob = "tools.common.futureDate";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setResult(calculateNumerology(name, dob));
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card as="form" onSubmit={onSubmit} noValidate className="space-y-5 p-5 sm:p-6">
        <Field
          label="Full name"
          htmlFor="num-name"
          error={errors.name ? t(errors.name) : undefined}
          hint="Use your full birth name in English letters."
        >
          <Input
            id="num-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: undefined }));
            }}
            placeholder="As written in English"
            autoComplete="name"
            lang="en"
            aria-invalid={Boolean(errors.name) || undefined}
          />
        </Field>
        <Field label="Date of birth" htmlFor="num-dob" error={errors.dob ? t(errors.dob) : undefined}>
          <Input
            id="num-dob"
            type="date"
            value={dob}
            max={today}
            min="1900-01-01"
            onChange={(e) => {
              setDob(e.target.value);
              setErrors((x) => ({ ...x, dob: undefined }));
            }}
            aria-invalid={Boolean(errors.dob) || undefined}
          />
        </Field>
        <Button type="submit" variant="gold" size="lg" className="w-full">
          <Calculator className="size-5" aria-hidden /> Calculate numbers
        </Button>
      </Card>

      <section aria-live="polite" className="min-w-0">
        {result && (
          <>
            <h2 className="mb-4 font-display text-2xl font-semibold">Your core numbers</h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {NUMBERS.map((key) => {
                const { value, steps } = result[key];
                return (
                  <li key={key}>
                    <Card className="flex h-full gap-4 p-5">
                      <span
                        className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-cosmic font-display text-3xl font-semibold text-gold-300"
                        aria-hidden
                      >
                        {value}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {t(`tools.numerology.${key}`)}: <span className="sr-only">{value}</span>
                        </h3>
                        <p className="text-xs text-muted">{t(`tools.numerology.${key}Desc`)}</p>
                        {value > 0 && (
                          <>
                            <p className="mt-2 flex flex-wrap items-center gap-2 font-medium text-brand-700 dark:text-gold-300">
                              {t(`tools.numerology.meanings.${value}.title`)}
                              {isMaster(value) && <Badge tone="gold">Master number</Badge>}
                            </p>
                            <p className="mt-1 text-sm text-muted">{t(`tools.numerology.meanings.${value}.text`)}</p>
                          </>
                        )}
                        <p className="mt-2 break-words tabular-nums text-[11px] text-muted/80">
                          {`Calculation: ${steps}`}
                        </p>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
