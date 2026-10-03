import { Lightbulb } from "lucide-react";

/**
 * Renders structured article sections: { id, h, p[], list?, tip? }.
 * TODO(cms): swap for the CMS rich-text renderer once content moves there.
 */
export function ArticleBody({ sections, tipLabel }) {
  return (
    <div className="space-y-10">
      {sections.map((s) => (
        <section key={s.id} aria-labelledby={s.id}>
          <h2 id={s.id} className="scroll-mt-24 font-display text-xl font-semibold sm:text-2xl">
            {s.h}
          </h2>
          <div className="mt-3 space-y-4 text-base leading-relaxed text-fg/90 sm:text-lg">
            {s.p?.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {s.list?.length > 0 && (
              <ul className="space-y-2 pl-1">
                {s.list.map((li, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {s.tip && (
            <aside className="mt-5 flex gap-3 rounded-2xl border border-gold-400/40 bg-gold-100/60 p-4 text-sm dark:bg-gold-700/15">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-gold-600 dark:text-gold-400" aria-hidden />
              <div>
                <p className="font-semibold text-gold-700 dark:text-gold-300">{tipLabel}</p>
                <p className="mt-0.5 text-fg/90">{s.tip}</p>
              </div>
            </aside>
          )}
        </section>
      ))}
    </div>
  );
}
