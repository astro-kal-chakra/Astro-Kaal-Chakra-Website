"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * FAQ accordion with smooth open/close: the answer animates its height (grid rows 0fr → 1fr) and fades in,
 * the + icon turns into ×. Works as an accordion: first question open by default, only one open at a time.
 * Answers stay in the HTML, so search engines read them even when closed.
 */
export function ProductFaq({ faqs }) {
  // Accordion: one answer open at a time. Opening another closes the current one; clicking the open one closes it.
  const [open, setOpen] = useState(0);
  const toggle = (i) => setOpen((cur) => (cur === i ? null : i));

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        const id = `store-faq-${i}`;
        return (
          <div
            key={f.q}
            className={cn(
              "overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow] duration-300",
              isOpen ? "border-brand-200 shadow-[0_10px_30px_-18px_rgb(194_65_12/0.45)] dark:border-brand-800" : "border-line hover:border-brand-200 dark:hover:border-brand-800"
            )}
          >
            <h3>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={id}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-fg"
              >
                {f.q}
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition duration-300",
                    isOpen ? "rotate-45 bg-brand-600 text-white dark:bg-brand-400 dark:text-brand-950" : "bg-surface-muted text-muted"
                  )}
                >
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div
              id={id}
              role="region"
              className={cn("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="min-h-0">
                <p className={cn("px-5 pb-5 text-sm leading-relaxed text-muted transition duration-300", isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0")}>
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
