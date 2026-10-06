import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-muted", className)} aria-hidden />;
}

/** A <span> (display: block) so it is valid inside <p>, <button> and other inline-only parents. */
export function Spinner({ className }) {
  return (
    <span
      className={cn("block size-6 shrink-0 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600", className)}
      role="status"
      aria-label="Loading"
    />
  );
}
