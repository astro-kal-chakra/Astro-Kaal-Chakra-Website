import { CircleCheck, MessageCircle, Sparkles, TriangleAlert } from "lucide-react";
import { routes } from "@/config/routes";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Plain-language reading under a tool result (see lib/readings.js):
 * { title, intro, sections: [{ heading, text }], strengths: [], cautions: [], advice }.
 */
export function ReadingCard({ reading, cta = "Discuss with an astrologer" }) {
  if (!reading) return null;
  return (
    <Card as="section" aria-labelledby="reading-title" className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-line bg-surface-muted p-4 sm:p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div>
          <h3 id="reading-title" className="font-display text-xl font-semibold">{reading.title}</h3>
          {reading.intro && <p className="mt-0.5 text-sm text-muted">{reading.intro}</p>}
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {reading.sections.map((s) => (
          <div key={s.heading}>
            <h4 className="font-semibold text-brand-700 dark:text-gold-300">{s.heading}</h4>
            <p className="mt-1 leading-relaxed text-fg/90">{s.text}</p>
          </div>
        ))}

        {(reading.strengths?.length > 0 || reading.cautions?.length > 0) && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reading.strengths?.length > 0 && (
              <div className="rounded-2xl border border-green-500/25 bg-green-50 p-4 dark:bg-green-900/15">
                <p className="mb-2 text-sm font-semibold text-green-800 dark:text-green-300">Working in your favour</p>
                <ul className="space-y-1.5 text-sm">
                  {reading.strengths.map((x) => (
                    <li key={x} className="flex gap-2">
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {reading.cautions?.length > 0 && (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-50 p-4 dark:bg-amber-900/15">
                <p className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">Worth paying attention to</p>
                <ul className="space-y-1.5 text-sm">
                  {reading.cautions.map((x) => (
                    <li key={x} className="flex gap-2">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {reading.advice && (
          <div className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-muted">{reading.advice}</p>
            <ButtonLink href={`${routes.astrologers}?online=1`} variant="primary" size="sm" className="shrink-0">
              <MessageCircle className="size-4" aria-hidden /> {cta}
            </ButtonLink>
          </div>
        )}
      </div>
    </Card>
  );
}
