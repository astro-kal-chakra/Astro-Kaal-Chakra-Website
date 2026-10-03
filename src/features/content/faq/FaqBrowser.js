"use client";

import { useMemo, useState } from "react";
import { CreditCard, MessageCircle, RotateCcw, Search, ShieldCheck, UserRound } from "lucide-react";
import { routes } from "@/config/routes";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { inputClasses } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { label as t } from "@/lib/labels";

const ICONS = { consultations: MessageCircle, payments: CreditCard, refunds: RotateCcw, privacy: ShieldCheck, account: UserRound };

/**
 * Categorised FAQs with instant search. All answers are server-rendered in the
 * initial HTML (closed <details>), so they stay crawlable.
 * @param {{ faqs: Record<string, {q:string,a:string}[]>, categories: string[] }} props
 */
export function FaqBrowser({ faqs, categories }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return categories
      .filter((c) => active === "all" || c === active)
      .map((c) => ({
        id: c,
        items: (faqs[c] || []).filter((f) => !needle || f.q.toLowerCase().includes(needle) || f.a.toLowerCase().includes(needle)),
      }))
      .filter((g) => g.items.length);
  }, [faqs, categories, query, active]);

  const count = groups.reduce((n, g) => n + g.items.length, 0);
  const tab = (on) =>
    cn(
      "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
      on
        ? "border-brand-600 bg-brand-600 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-brand-950"
        : "border-line bg-surface hover:bg-surface-muted"
    );

  return (
    <div>
      <div className="relative max-w-xl">
        <label htmlFor="faq-search" className="sr-only">
          Search FAQs
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className={cn(inputClasses, "pl-9")}
          aria-describedby="faq-count"
        />
      </div>

      <div role="group" aria-label="Frequently asked questions" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" className={tab(active === "all")} aria-pressed={active === "all"} onClick={() => setActive("all")}>
          All
        </button>
        {categories.map((c) => {
          const Icon = ICONS[c] || MessageCircle;
          return (
            <button key={c} type="button" className={tab(active === c)} aria-pressed={active === c} onClick={() => setActive(c)}>
              <Icon className="size-4" aria-hidden /> {t(`content.faq.categories.${c}`)}
            </button>
          );
        })}
      </div>

      <p id="faq-count" className="mt-4 text-sm text-muted" aria-live="polite">
        {`${count} results`}
      </p>

      {groups.length ? (
        <div className="mt-4 space-y-10">
          {groups.map((g) => {
            const Icon = ICONS[g.id] || MessageCircle;
            return (
              <section key={g.id} id={`faq-${g.id}`} aria-labelledby={`faq-${g.id}-title`} className="scroll-mt-24">
                <h2 id={`faq-${g.id}-title`} className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-gold-300">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  {t(`content.faq.categories.${g.id}`)}
                </h2>
                <Accordion items={g.items} />
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No matching questions"
          description="Try different words or contact our support team."
          action={
            <ButtonLink href={routes.contact} variant="outline">
              Contact us
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
