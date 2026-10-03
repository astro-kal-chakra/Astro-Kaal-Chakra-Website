import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LocaleLink } from "./LocaleLink";

const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300",
  gold: "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-sm shadow-brand-500/30",
  /** White button for use on saffron (bg-cosmic) bands. */
  light: "bg-white text-brand-700 hover:bg-brand-50 shadow-sm shadow-brand-900/20",
  outline: "border border-line bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg hover:bg-surface-muted",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300",
};

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "size-10",
};

export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-colors",
    "disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

/**
 * `loading` disables the button and shows a spinner — use it on every
 * payment / session action to prevent double submissions.
 */
export function Button({ variant, size, className, loading = false, disabled, children, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, ...props }) {
  return <LocaleLink className={buttonClasses({ variant, size, className })} {...props} />;
}
