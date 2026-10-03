"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Multi-select chips backed by real checkboxes (keyboard + screen-reader friendly).
 * @param {{ legend: string, name: string, options: {value:string,label:string}[], value: string[], onChange: (v:string[])=>void, error?: string, hint?: string }} props
 */
export function ChoiceChips({ legend, name, options, value, onChange, error, hint, className }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const errId = `${name}-error`;
  return (
    <fieldset className={cn("space-y-2", className)} aria-describedby={error ? errId : undefined}>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          const id = `${name}-${o.value}`.replace(/[^a-zA-Z0-9_-]/g, "-");
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={cn(
                "inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                on
                  ? "border-brand-600 bg-brand-600 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-brand-950"
                  : "border-line bg-surface hover:bg-surface-muted"
              )}
            >
              <input id={id} type="checkbox" name={name} value={o.value} checked={on} onChange={() => toggle(o.value)} className="sr-only" />
              {on && <Check className="size-3.5" aria-hidden />}
              {o.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </fieldset>
  );
}
