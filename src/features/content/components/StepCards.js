import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

/**
 * Numbered step cards. Server-safe.
 * @param {{ steps: { title: string, text: string, icon?: any }[], label?: (n:number)=>string, className?: string }} props
 */
export function StepCards({ steps, label, className }) {
  return (
    <ol className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {steps.map((s, i) => (
        <Card as="li" key={s.title} className="relative p-5">
          <span className="absolute right-4 top-3 font-display text-4xl font-bold text-brand-100 dark:text-brand-800" aria-hidden>
            {i + 1}
          </span>
          {s.icon ? (
            <s.icon className="size-7 text-gold-500" aria-hidden />
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-400">{label?.(i + 1)}</span>
          )}
          <h3 className="mt-3 font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted">{s.text}</p>
        </Card>
      ))}
    </ol>
  );
}
