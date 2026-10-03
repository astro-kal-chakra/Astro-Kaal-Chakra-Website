"use client";

import { useSyncExternalStore } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PAGE_LANGUAGE, TRANSLATE_LANGUAGES } from "../config";
import { getCurrentLanguage, setLanguage, subscribeLanguage } from "../lib/googleTranslate";

/**
 * Brand-styled language switch that drives Google Translate.
 * - `compact`: short labels (EN / हिं) for tight headers on phones.
 * - `block`: full width with large touch targets, for menus and settings.
 * Switches to a <select> automatically when more than 3 languages are configured.
 */
export function LanguageToggle({ variant = "default", className }) {
  const current = useSyncExternalStore(subscribeLanguage, getCurrentLanguage, () => PAGE_LANGUAGE);
  const compact = variant === "compact";
  const block = variant === "block";

  if (TRANSLATE_LANGUAGES.length > 3) {
    return (
      <label translate="no" className={cn("notranslate relative inline-flex items-center", block && "w-full", className)}>
        <Languages className="pointer-events-none absolute left-3 size-4 text-muted" aria-hidden />
        <span className="sr-only">Language</span>
        <select
          value={current}
          onChange={(e) => setLanguage(e.target.value)}
          className={cn(
            "h-10 cursor-pointer appearance-none rounded-full border border-line bg-surface pl-9 pr-4 text-sm font-medium",
            block && "w-full"
          )}
        >
          {TRANSLATE_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      translate="no"
      className={cn(
        "notranslate inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface p-0.5",
        block && "flex w-full",
        className
      )}
    >
      {!compact && !block && <Languages className="ml-2 mr-1 size-4 text-muted" aria-hidden />}
      {TRANSLATE_LANGUAGES.map((l) => {
        const active = current === l.code;
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={active}
            lang={l.code}
            onClick={() => setLanguage(l.code)}
            className={cn(
              "rounded-full font-semibold transition-colors",
              compact ? "h-7 min-w-9 px-2 text-xs" : block ? "h-11 flex-1 text-base" : "h-8 px-3 text-sm",
              active
                ? "bg-brand-600 text-white dark:bg-gold-500 dark:text-brand-950"
                : "text-muted hover:bg-surface-muted hover:text-fg"
            )}
          >
            {compact ? l.short : l.label}
          </button>
        );
      })}
    </div>
  );
}
