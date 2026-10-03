"use client";

import { useRef, useState } from "react";
import { HeartHandshake, MessageCircle } from "lucide-react";
import { routes } from "@/config/routes";
import { astroToolsService } from "@/lib/api/services/astro-tools.service";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EMPTY_BIRTH } from "../lib/constants";
import { isoDateIn } from "../lib/format";
import { useAstroNames } from "../lib/useAstroNames";
import { validateBirth } from "../lib/validate";
import { BirthFields } from "./BirthFields";
import { MockNotice } from "./MockNotice";
import { ScoreRing } from "./ScoreRing";
import { label as t } from "@/lib/labels";

const verdictFor = (score) => (score > 32 ? "excellent" : score >= 25 ? "good" : score >= 18 ? "average" : "low");
const VERDICT_TONE = { excellent: "success", good: "success", average: "warning", low: "danger" };
const VERDICT_BOX = {
  success: "border-green-500/30 bg-green-50 dark:bg-green-900/20",
  warning: "border-amber-500/30 bg-amber-50 dark:bg-amber-900/20",
  danger: "border-red-500/30 bg-red-50 dark:bg-red-900/20",
};

function useAttr() {
  const n = useAstroNames();
  return (a) => {
    if (!a) return "—";
    const map = { varna: n.varna, gana: n.gana, nadi: n.nadi, sign: n.sign, nakshatra: n.nakshatra };
    return map[a.type]?.(a.value) ?? "—";
  };
}

export function KootaTable({ result }) {
  const attr = useAttr();
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <caption className="px-4 pt-4 text-left font-semibold">Ashtakoot Guna Milan</caption>
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-line">
              <th scope="col" className="px-4 py-3 font-semibold">Koota</th>
              <th scope="col" className="px-4 py-3 font-semibold">Boy</th>
              <th scope="col" className="px-4 py-3 font-semibold">Girl</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Obtained</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Max</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result.kootas.map((k) => {
              const pct = k.obtained / k.max;
              return (
                <tr key={k.key}>
                  <th scope="row" className="px-4 py-3">
                    <span className="block font-semibold">{t(`tools.matching.kootas.${k.key}.name`)}</span>
                    <span className="block text-xs font-normal text-muted">{t(`tools.matching.kootas.${k.key}.desc`)}</span>
                  </th>
                  <td className="px-4 py-3">{attr(k.boy)}</td>
                  <td className="px-4 py-3">{attr(k.girl)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex min-w-10 justify-center rounded-full px-2 py-0.5 font-semibold tabular-nums",
                        pct >= 0.75
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : pct >= 0.4
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      )}
                    >
                      {k.obtained}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted">{k.max}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-line bg-surface-muted font-semibold">
              <th scope="row" colSpan={3} className="px-4 py-3">Total</th>
              <td className="px-4 py-3 text-right tabular-nums">{result.total}</td>
              <td className="px-4 py-3 text-right tabular-nums">{result.max}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

export function ManglikCard({ result }) {
  const n = useAstroNames();
  const both = result.boy.manglik && result.girl.manglik;
  const none = !result.boy.manglik && !result.girl.manglik;
  const summary = none ? "manglikNone" : both ? "manglikBoth" : "manglikOne";
  return (
    <Card className="p-4 sm:p-5">
      <h3 className="mb-3 font-semibold">Manglik check</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {["boy", "girl"].map((who) => {
          const p = result[who];
          return (
            <div key={who} className="rounded-xl bg-surface-muted p-3">
              <p className="text-xs uppercase tracking-wide text-muted">{t(`tools.matching.${who}`)}</p>
              <p className="font-semibold">{p.name || t(`tools.matching.${who}`)}</p>
              <p className="mt-1 text-sm text-muted">
                {n.sign(p.moonSign)} · {n.nakshatra(p.nakshatra)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={p.manglik ? "warning" : "success"}>
                  {p.manglik ? "Manglik" : "Not Manglik"}
                </Badge>
                <span className="text-xs text-muted">{`Mars in house ${p.marsHouse}`}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className={cn("mt-3 text-sm", none || both ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400")}>
        {t(`tools.matching.${summary}`)}
      </p>
    </Card>
  );
}

export function MatchingTool() {
  const { toast } = useToast();
  const [boy, setBoy] = useState({ ...EMPTY_BIRTH, gender: "male" });
  const [girl, setGirl] = useState({ ...EMPTY_BIRTH, gender: "female" });
  const [errors, setErrors] = useState({ boy: {}, girl: {} });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [today] = useState(() => isoDateIn(new Date()));
  const resultsRef = useRef(null);

  const updater = (who, set) => (patch) => {
    set((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e[who] };
      Object.keys(patch).forEach((k) => delete next[k]);
      return { ...e, [who]: next };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = { boy: validateBirth(boy, { today }), girl: validateBirth(girl, { today }) };
    setErrors(errs);
    if (Object.keys(errs.boy).length || Object.keys(errs.girl).length) return;
    setLoading(true);
    try {
      setResult(await astroToolsService.matchKundli({ boy, girl }));
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch {
      toast({ type: "error", title: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const verdict = result && verdictFor(result.total);
  const tone = verdict && VERDICT_TONE[verdict];

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[
            { who: "boy", value: boy, set: setBoy },
            { who: "girl", value: girl, set: setGirl },
          ].map(({ who, value, set }) => (
            <Card key={who} as="fieldset" aria-labelledby={`match-${who}-title`} className="min-w-0 p-5 sm:p-6">
              <h2 id={`match-${who}-title`} className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                <span aria-hidden className={cn("size-2.5 rounded-full", who === "boy" ? "bg-brand-500" : "bg-gold-500")} />
                {t(`tools.matching.${who}Details`)}
              </h2>
              <BirthFields
                idPrefix={`match-${who}`}
                value={value}
                onChange={updater(who, set)}
                errors={errors[who]}
                maxDate={today}
                withGender={false}
              />
            </Card>
          ))}
        </div>
        <div className="flex justify-center">
          <Button type="submit" variant="gold" size="lg" loading={loading} className="w-full sm:w-auto sm:min-w-64">
            <HeartHandshake className="size-5" aria-hidden /> Match Kundli
          </Button>
        </div>
      </form>

      <section ref={resultsRef} aria-live="polite" className="scroll-mt-20">
        {result && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Compatibility result</h2>
            <MockNotice show={result.isMock} />
            <Card className={cn("flex flex-col items-center gap-5 border p-5 sm:flex-row sm:p-6", VERDICT_BOX[tone])}>
              <ScoreRing value={result.total} max={result.max} label="Gunas matched" tone={tone} />
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted">{`${result.total} out of ${result.max}`}</p>
                <h3 className="font-display text-2xl font-semibold">{t(`tools.matching.verdict.${verdict}.title`)}</h3>
                <p className="mt-1 max-w-xl text-muted">{t(`tools.matching.verdict.${verdict}.text`)}</p>
                <ButtonLink href={`${routes.astrologers}?online=1`} variant="primary" className="mt-4">
                  <MessageCircle className="size-4" aria-hidden /> Talk to an astrologer
                </ButtonLink>
              </div>
            </Card>
            <KootaTable result={result} />
            <ManglikCard result={result} />
          </div>
        )}
      </section>
    </div>
  );
}
