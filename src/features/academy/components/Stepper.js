import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STEPS = ["Your details", "Choose plan", "Payment"];

/** Enrolment progress: details → plan → payment. `current` is the 0-based active step. */
export function Stepper({ current }) {
  return (
    <ol className="flex items-center justify-center gap-2 text-xs font-semibold sm:text-sm">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          {i > 0 && <span className={cn("h-px w-6 transition-colors duration-500 sm:w-12", i <= current ? "bg-brand-500" : "bg-line")} aria-hidden />}
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full border transition-all duration-500",
              i < current && "border-brand-600 bg-brand-600 text-white",
              i === current && "border-brand-600 text-brand-700 ring-4 ring-brand-100 dark:text-brand-200 dark:ring-brand-900",
              i > current && "border-line text-muted"
            )}
            aria-current={i === current ? "step" : undefined}
          >
            {i < current ? <Check className="size-4" aria-hidden /> : i + 1}
          </span>
          <span className={cn("hidden sm:inline", i === current ? "text-fg" : "text-muted")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
