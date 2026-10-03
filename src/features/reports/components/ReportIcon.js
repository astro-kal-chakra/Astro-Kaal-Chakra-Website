import { Briefcase, CalendarDays, HeartHandshake, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ICONS = { scroll: ScrollText, heart: HeartHandshake, calendar: CalendarDays, briefcase: Briefcase };

/** Gold-on-green medallion for a report type. */
export function ReportIcon({ icon, className, size = "md" }) {
  const Icon = ICONS[icon] || ScrollText;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-gold-300 shadow-md ring-1 ring-gold-400/30",
        size === "lg" ? "size-16" : "size-12",
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-8" : "size-6"} aria-hidden />
    </span>
  );
}
