import { cn } from "@/lib/utils/cn";

/** Red pulsing "LIVE" pill. Server-safe. */
export function LiveBadge({ label, className }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white", className)}>
      <span className="size-1.5 animate-pulse-dot rounded-full bg-white" aria-hidden />
      {label}
    </span>
  );
}
