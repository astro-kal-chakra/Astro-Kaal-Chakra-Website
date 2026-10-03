import { cn } from "@/lib/utils/cn";

const TONES = {
  neutral: "bg-surface-muted text-muted",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200",
  gold: "bg-gold-100 text-gold-700 dark:bg-gold-700/30 dark:text-gold-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

export function Badge({ tone = "neutral", className, ...props }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", TONES[tone], className)}
      {...props}
    />
  );
}
